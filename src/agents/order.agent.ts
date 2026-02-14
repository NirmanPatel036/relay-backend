import { BaseAgent, AgentConfig } from './base.agent.js';
import { OrderService } from '../services/order.service.js';

const orderService = new OrderService();

export class OrderAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      type: 'order',
      name: 'Order Agent',
      description: 'Handles order status, tracking, and modifications',
      systemPrompt: `You are an Order Management Agent specialized in handling order-related queries.

Your responsibilities:
- Check order status and tracking information
- Provide delivery estimates
- Handle order modifications
- Process cancellation requests
- Resolve shipping issues

Important guidelines:
- Always provide specific details when available (order numbers, tracking numbers, dates).
- Be empathetic when dealing with delayed or problematic orders.
- If order information is not found in the system, politely inform the user and suggest they verify the order number or check their confirmation email.
- Never mention technical details like "tools", "system", or "database" - just provide helpful responses.
- If data is unavailable, offer alternative solutions like checking their email confirmation or account history.`,
      tools: [
        {
          name: 'fetch_order_details',
          description: 'Fetches detailed information about a specific order including items, status, and shipping details',
          parameters: {
            orderNumber: {
              type: 'string',
              description: 'The order number (e.g., ORD-2026-1001)',
              required: true,
            },
          },
          execute: async (params: { orderNumber: string }) => {
            return orderService.getOrderByNumber(params.orderNumber);
          },
        },
        {
          name: 'check_delivery_status',
          description: 'Checks the current delivery status, tracking information, and location of an order',
          parameters: {
            orderNumber: {
              type: 'string',
              description: 'The order number to track (e.g., ORD-2026-1001)',
              required: true,
            },
          },
          execute: async (params: { orderNumber: string }) => {
            return orderService.getDeliveryStatus(params.orderNumber);
          },
        },
        {
          name: 'get_user_orders',
          description: 'Retrieves all orders for a specific user with pagination support',
          parameters: {
            userId: {
              type: 'string',
              description: 'The user ID to fetch orders for',
              required: true,
            },
            limit: {
              type: 'number',
              description: 'Maximum number of orders to return (default: 10)',
              required: false,
            },
          },
          execute: async (params: { userId: string; limit?: number }) => {
            return orderService.getUserOrders(params.userId, params.limit || 10);
          },
        },
      ],
    };

    super(config);
  }

  protected generateReasoning(query: string, _response: string): string {
    const hasOrderNumber = /#\d+/.test(query);
    const isTracking = query.toLowerCase().includes('track') || query.toLowerCase().includes('where');
    const isDelay = query.toLowerCase().includes('delay') || query.toLowerCase().includes('late');

    if (hasOrderNumber && isTracking) {
      return 'Order number detected. Fetching tracking information and current delivery status from logistics system.';
    } else if (isDelay) {
      return 'Identified delivery concern. Checking order status and providing updated timeline with explanation.';
    } else if (hasOrderNumber) {
      return 'Order number found. Retrieving complete order details including items, status, and delivery information.';
    }

    return 'Processing order-related inquiry. Accessing order management system for relevant information.';
  }
}
