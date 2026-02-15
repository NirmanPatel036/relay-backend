import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { UserService } from '../services/user.service.js';

const userRoutes = new Hono();
const prisma = new PrismaClient();
const userService = new UserService();

// Sync user from Supabase Auth to application database
userRoutes.post('/sync', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, email, name } = body;

    if (!userId || !email) {
      return c.json({ error: 'userId and email are required' }, 400);
    }

    const user = await userService.upsertUser(userId, email, name);

    return c.json({
      message: 'User synced successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tier: user.tier,
      },
    });
  } catch (error) {
    console.error('Error syncing user:', error);
    return c.json({ error: 'Failed to sync user' }, 500);
  }
});

// Get current user profile
userRoutes.get('/me', async (c) => {
  try {
    const userId = c.req.header('x-user-id');

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const user = await userService.getUserById(userId);

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return c.json({ error: 'Failed to fetch user' }, 500);
  }
});

// Check if user has sample data
userRoutes.get('/check-sample-data', async (c) => {
  try {
    const userId = c.req.header('x-user-id');

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const orderCount = await prisma.orders.count({
      where: { user_id: userId },
    });

    return c.json({ hasData: orderCount > 0 });
  } catch (error) {
    console.error('Error checking sample data:', error);
    return c.json({ error: 'Failed to check sample data' }, 500);
  }
});

// Populate sample data for current user
userRoutes.post('/populate-sample-data', async (c) => {
  try {
    const userId = c.req.header('x-user-id');

    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if data already exists
    const existingOrders = await prisma.orders.findMany({
      where: { user_id: userId },
    });

    if (existingOrders.length > 0) {
      return c.json(
        {
          message: 'Sample data already exists for this user',
          ordersCount: existingOrders.length,
        },
        200
      );
    }

    // Create sample orders
    await prisma.orders.createMany({
      data: [
        {
          user_id: userId,
          order_number: '#8829',
          status: 'shipped',
          items: [
            {
              name: 'Wireless Headphones',
              quantity: 1,
              price: 89.99,
            },
          ],
          total_amount: 89.99,
          shipping_address: {
            street: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94102',
          },
          estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          tracking_number: 'TRK-1234567890',
        },
        {
          user_id: userId,
          order_number: '#7742',
          status: 'delivered',
          items: [
            {
              name: 'USB-C Cable',
              quantity: 2,
              price: 15.99,
            },
            {
              name: 'Phone Case',
              quantity: 1,
              price: 24.99,
            },
          ],
          total_amount: 56.97,
          shipping_address: {
            street: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94102',
          },
          estimated_delivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          tracking_number: 'TRK-0987654321',
        },
        {
          user_id: userId,
          order_number: '#9234',
          status: 'processing',
          items: [
            {
              name: 'Laptop Stand',
              quantity: 1,
              price: 49.99,
            },
          ],
          total_amount: 49.99,
          shipping_address: {
            street: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94102',
          },
          estimated_delivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          tracking_number: null,
        },
      ],
    });

    // Create sample payments
    await prisma.payments.create({
      data: {
        user_id: userId,
        invoice_number: 'INV-2024-001',
        amount: 89.99,
        status: 'paid',
        payment_method: 'credit_card',
        description: 'Premium Subscription',
        invoice_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        paid_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        metadata: {
          billingPeriod: 'Jan 2024',
          items: [
            {
              description: 'Premium Subscription',
              amount: 89.99,
            },
          ],
        },
      },
    });

    await prisma.payments.create({
      data: {
        user_id: userId,
        invoice_number: 'INV-2024-002',
        amount: 29.99,
        status: 'paid',
        payment_method: 'paypal',
        description: 'Basic Subscription',
        invoice_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        paid_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        metadata: {
          billingPeriod: 'Feb 2024',
          items: [
            {
              description: 'Basic Subscription',
              amount: 29.99,
            },
          ],
        },
      },
    });

    await prisma.payments.create({
      data: {
        user_id: userId,
        invoice_number: 'INV-2024-003',
        amount: 149.99,
        status: 'refunded',
        payment_method: 'credit_card',
        description: 'Annual Subscription',
        refund_amount: 149.99,
        refund_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        refund_reason: 'Customer requested cancellation',
        invoice_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        paid_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        metadata: {
          billingPeriod: 'Mar 2024',
          items: [
            {
              description: 'Annual Subscription',
              amount: 149.99,
            },
          ],
        },
      },
    });

    return c.json({
      message: 'Sample data populated successfully',
      orders: 3,
      payments: 3,
    });
  } catch (error) {
    console.error('Error populating sample data:', error);
    return c.json({ error: 'Failed to populate sample data' }, 500);
  }
});

export default userRoutes;
