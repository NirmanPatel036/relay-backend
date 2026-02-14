import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PaymentService {
  async getInvoiceByNumber(invoiceNumber: string) {
    const payment = await prisma.payments.findUnique({
      where: { invoice_number: invoiceNumber },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!payment) {
      throw new Error(`Invoice ${invoiceNumber} not found`);
    }

    return {
      invoiceNumber: payment.invoice_number,
      amount: payment.amount,
      status: payment.status,
      paymentMethod: payment.payment_method,
      transactionId: payment.transaction_id,
      description: payment.description,
      invoiceDate: payment.invoice_date,
      dueDate: payment.due_date,
      paidDate: payment.paid_date,
      refundAmount: payment.refund_amount,
      refundDate: payment.refund_date,
      refundReason: payment.refund_reason,
    };
  }

  async getRefundStatus(invoiceNumber?: string, userId?: string) {
    const where: any = {};

    if (invoiceNumber) {
      where.invoice_number = invoiceNumber;
    } else if (userId) {
      where.user_id = userId;
      where.status = 'refunded';
    }

    const payments = await prisma.payments.findMany({
      where,
      orderBy: { updated_at: 'desc' },
      take: 10,
    });

    return payments
      .filter((p: any) => p.refund_amount !== null)
      .map((p: any) => ({
        invoiceNumber: p.invoice_number,
        originalAmount: p.amount,
        refundAmount: p.refund_amount,
        refundDate: p.refund_date,
        refundReason: p.refund_reason,
        status: p.status,
      }));
  }

  async getUserPayments(userId: string, limit: number = 10) {
    const payments = await prisma.payments.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: limit,
    });

    // Return plain objects to avoid Prisma metadata
    return payments.map((payment: any) => ({
      id: payment.id,
      invoiceNumber: payment.invoice_number,
      amount: payment.amount,
      status: payment.status,
      paymentMethod: payment.payment_method,
      invoiceDate: payment.invoice_date,
      dueDate: payment.due_date,
      paidDate: payment.paid_date,
      createdAt: payment.created_at,
    }));
  }

  async processRefund(invoiceNumber: string, amount: number, reason: string) {
    return prisma.payments.update({
      where: { invoice_number: invoiceNumber },
      data: {
        status: 'refunded',
        refund_amount: amount,
        refund_date: new Date(),
        refund_reason: reason,
      },
    });
  }

  async updatePaymentStatus(invoiceNumber: string, status: string) {
    return prisma.payments.update({
      where: { invoice_number: invoiceNumber },
      data: {
        status,
        paid_date: status === 'paid' ? new Date() : undefined,
      },
    });
  }
}
