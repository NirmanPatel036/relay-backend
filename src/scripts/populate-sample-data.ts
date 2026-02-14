import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function populateSampleData(userId: string) {
  console.log(`\n🔄 Populating sample data for user: ${userId}\n`);

  try {
    // Check if data already exists
    const existingOrders = await prisma.orders.findMany({
      where: { user_id: userId },
    });

    if (existingOrders.length > 0) {
      console.log('⚠️  Sample data already exists for this user. Skipping...\n');
      return;
    }

    // Insert sample orders
    console.log('📦 Creating sample orders...');
    
    const order1 = await prisma.orders.create({
      data: {
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
        estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // +2 days
        tracking_number: 'TRK-1234567890',
      },
    });
    console.log(`  ✅ Created order: ${order1.order_number}`);

    const order2 = await prisma.orders.create({
      data: {
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
        estimated_delivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // -1 day
        tracking_number: 'TRK-0987654321',
      },
    });
    console.log(`  ✅ Created order: ${order2.order_number}`);

    const order3 = await prisma.orders.create({
      data: {
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
        estimated_delivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // +5 days
        tracking_number: null,
      },
    });
    console.log(`  ✅ Created order: ${order3.order_number}`);

    // Insert sample payments
    console.log('\n💳 Creating sample payments...');

    const payment1 = await prisma.payments.create({
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
    console.log(`  ✅ Created invoice: ${payment1.invoice_number}`);

    const payment2 = await prisma.payments.create({
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
    console.log(`  ✅ Created invoice: ${payment2.invoice_number}`);

    const payment3 = await prisma.payments.create({
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
    console.log(`  ✅ Created invoice: ${payment3.invoice_number}`);

    console.log('\n✅ Sample data populated successfully!\n');
    console.log('Test queries:');
    console.log('  - "Where is my order #8829?"');
    console.log('  - "Show me invoice INV-2024-001"');
    console.log('  - "Track order #7742"');
    console.log('  - "Refund status for INV-2024-003"\n');
  } catch (error) {
    console.error('❌ Error populating sample data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script with user ID from command line argument
const userId = process.argv[2];

if (!userId) {
  console.error('❌ Error: User ID is required');
  console.log('Usage: npm run populate-data <user-id>');
  console.log('Example: npm run populate-data 123e4567-e89b-12d3-a456-426614174000\n');
  process.exit(1);
}

populateSampleData(userId)
  .then(() => {
    console.log('Done! 🎉');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error.message);
    process.exit(1);
  });
