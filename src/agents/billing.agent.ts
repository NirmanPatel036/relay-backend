import { BaseAgent, AgentConfig } from './base.agent.js';
import { PaymentService } from '../services/payment.service.js';

const paymentService = new PaymentService();

export class BillingAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      type: 'billing',
      name: 'Billing Agent',
      description: 'Handles payment issues, refunds, and invoices',
      systemPrompt: `You are a Billing Agent specialized in handling payment and financial queries.

Your responsibilities:
- Process refund requests
- Provide invoice information
- Resolve payment issues
- Handle subscription queries
- Explain charges and fees

Important guidelines:
- Be precise with financial information. Always verify amounts and dates.
- Show empathy when dealing with billing disputes or financial concerns.
- If invoice or payment information is not found in the system, politely inform the user and suggest they verify the invoice/payment number or contact their account manager.
- Never mention technical details like "tools", "system", or "database" - just provide helpful responses.
- If data is unavailable, offer alternative solutions like checking their email confirmation or account history.`,
      tools: [
        {
          name: 'get_invoice_details',
          description: 'Retrieves detailed information about an invoice including amount, status, and items',
          parameters: {
            invoiceNumber: {
              type: 'string',
              description: 'The invoice number (e.g., INV-2026-1001)',
              required: true,
            },
          },
          execute: async (params: { invoiceNumber: string }) => {
            return paymentService.getInvoiceByNumber(params.invoiceNumber);
          },
        },
        {
          name: 'check_refund_status',
          description: 'Checks the status of a refund request for an invoice or user',
          parameters: {
            invoiceNumber: {
              type: 'string',
              description: 'The invoice number to check refund status for (e.g., INV-2026-1001)',
              required: false,
            },
            userId: {
              type: 'string',
              description: 'The user ID to check refund status for (if no invoice number provided)',
              required: false,
            },
          },
          execute: async (params: { invoiceNumber?: string; userId?: string }) => {
            return paymentService.getRefundStatus(params.invoiceNumber, params.userId);
          },
        },
        {
          name: 'get_payment_history',
          description: 'Retrieves payment history for a user with pagination support',
          parameters: {
            userId: {
              type: 'string',
              description: 'The user ID to fetch payment history for',
              required: true,
            },
            limit: {
              type: 'number',
              description: 'Maximum number of payments to return (default: 10)',
              required: false,
            },
          },
          execute: async (params: { userId: string; limit?: number }) => {
            return paymentService.getUserPayments(params.userId, params.limit || 10);
          },
        },
      ],
    };

    super(config);
  }

  protected generateReasoning(query: string, _response: string): string {
    const hasInvoiceNumber = /INV-\d+/i.test(query) || query.toLowerCase().includes('invoice');
    const isRefund = query.toLowerCase().includes('refund');
    const isCharge = query.toLowerCase().includes('charge') || query.toLowerCase().includes('payment');

    if (hasInvoiceNumber && isRefund) {
      return 'Invoice number detected with refund request. Checking payment records and refund eligibility.';
    } else if (isRefund) {
      return 'Refund inquiry identified. Accessing transaction history and processing refund status check.';
    } else if (hasInvoiceNumber) {
      return 'Invoice reference found. Retrieving complete invoice details including amounts, dates, and payment status.';
    } else if (isCharge) {
      return 'Payment inquiry detected. Analyzing billing records to provide detailed charge information.';
    }

    return 'Processing billing inquiry. Accessing payment system for relevant financial information.';
  }
}
