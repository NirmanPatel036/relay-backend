import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class OrderService {
  async getOrderByNumber(orderNumber: string) {
    const order = await prisma.orders.findUnique({
      where: { order_number: orderNumber },
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

    if (!order) {
      throw new Error(`Order ${orderNumber} not found`);
    }

    return {
      orderNumber: order.order_number,
      status: order.status,
      items: order.items,
      totalAmount: order.total_amount,
      shippingAddress: order.shipping_address,
      trackingNumber: order.tracking_number,
      carrier: order.carrier,
      estimatedDelivery: order.estimated_delivery,
      actualDelivery: order.actual_delivery,
      createdAt: order.created_at,
    };
  }

  async getDeliveryStatus(orderNumber: string) {
    const order = await prisma.orders.findUnique({
      where: { order_number: orderNumber },
    });

    if (!order) {
      throw new Error(`Order ${orderNumber} not found`);
    }

    // Simulate tracking information
    const statusMessages: Record<string, string> = {
      pending: 'Order is being prepared',
      processing: 'Order is being packed',
      shipped: `Package is in transit with ${order.carrier || 'courier'}`,
      delivered: 'Package has been delivered',
      cancelled: 'Order has been cancelled',
    };

    return {
      orderNumber: order.order_number,
      status: order.status,
      statusMessage: statusMessages[order.status] || 'Status unknown',
      trackingNumber: order.tracking_number,
      carrier: order.carrier,
      currentLocation: this.getCurrentLocation(order.status),
      estimatedDelivery: order.estimated_delivery,
      actualDelivery: order.actual_delivery,
      lastUpdated: order.updated_at,
    };
  }

  async getUserOrders(userId: string, limit: number = 10) {
    const orders = await prisma.orders.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: limit,
    });

    // Return plain objects to avoid Prisma metadata
    return orders.map((order: any) => ({
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      items: order.items,
      totalAmount: order.total_amount,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    }));
  }

  async updateOrderStatus(orderNumber: string, status: string) {
    return prisma.orders.update({
      where: { order_number: orderNumber },
      data: { status },
    });
  }

  private getCurrentLocation(status: string): string {
    const locations: Record<string, string> = {
      pending: 'Warehouse - Processing Center',
      processing: 'Warehouse - Packing Area',
      shipped: 'In Transit - Regional Hub',
      delivered: 'Delivered to Customer',
      cancelled: 'N/A',
    };

    return locations[status] || 'Unknown';
  }
}
