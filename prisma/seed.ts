///<reference types="node" />
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create test users with Indian names - sequentially to avoid connection pool issues
  const users = [];
  
  const user1 = await prisma.users.upsert({
    where: { email: 'priya.sharma@gmail.com' },
    update: {},
    create: {
      id: randomUUID(),
      email: 'priya.sharma@gmail.com',
      name: 'Priya Sharma',
      tier: 'platinum',
    },
  });
  users.push(user1);

  const user2 = await prisma.users.upsert({
    where: { email: 'rahul.verma@outlook.com' },
    update: {},
    create: {
      id: randomUUID(),
      email: 'rahul.verma@outlook.com',
      name: 'Rahul Verma',
      tier: 'premium',
    },
  });
  users.push(user2);

  const user3 = await prisma.users.upsert({
    where: { email: 'ananya.gupta@yahoo.in' },
    update: {},
    create: {
      id: randomUUID(),
      email: 'ananya.gupta@yahoo.in',
      name: 'Ananya Gupta',
      tier: 'free',
    },
  });
  users.push(user3);

  const user4 = await prisma.users.upsert({
    where: { email: 'vikram.patel@gmail.com' },
    update: {},
    create: {
      id: randomUUID(),
      email: 'vikram.patel@gmail.com',
      name: 'Vikram Patel',
      tier: 'premium',
    },
  });
  users.push(user4);

  const user5 = await prisma.users.upsert({
    where: { email: 'neha.reddy@proton.me' },
    update: {},
    create: {
      id: randomUUID(),
      email: 'neha.reddy@proton.me',
      name: 'Neha Reddy',
      tier: 'platinum',
    },
  });
  users.push(user5);

  const user6 = await prisma.users.upsert({
    where: { email: 'arjun.malhotra@icloud.com' },
    update: {},
    create: {
      id: randomUUID(),
      email: 'arjun.malhotra@icloud.com',
      name: 'Arjun Malhotra',
      tier: 'free',
    },
  });
  users.push(user6);

  const user7 = await prisma.users.upsert({
    where: { email: 'kavya.krishnan@gmail.com' },
    update: {},
    create: {
      id: randomUUID(),
      email: 'kavya.krishnan@gmail.com',
      name: 'Kavya Krishnan',
      tier: 'premium',
    },
  });
  users.push(user7);

  const user8 = await prisma.users.upsert({
    where: { email: 'aditya.singh@yahoo.com' },
    update: {},
    create: {
      id: randomUUID(),
      email: 'aditya.singh@yahoo.com',
      name: 'Aditya Singh',
      tier: 'platinum',
    },
  });
  users.push(user8);

  console.log(`✅ Created ${users.length} users`);

  // Create test orders sequentially to avoid connection pool issues
  const orders = [];
  
  console.log('Creating orders...');
  
  // Priya Sharma's orders
  orders.push(await prisma.orders.upsert({
    where: { order_number: 'ORD-2026-1001' },
    update: {},
    create: {
      user_id: users[0].id,
      order_number: 'ORD-2026-1001',
      status: 'shipped',
      items: [
        { name: 'Sony WH-1000XM5 Headphones', quantity: 1, price: 29999 },
        { name: 'USB-C to 3.5mm Adapter', quantity: 1, price: 599 },
      ],
      total_amount: 30598,
      shipping_address: {
        street: '123 MG Road',
        city: 'Bangalore',
        state: 'Karnataka',
        zip: '560001',
      },
      tracking_number: 'DTDC8829100234',
      carrier: 'DTDC',
      estimated_delivery: new Date('2026-02-17T18:00:00Z'),
    },
  }));

  orders.push(await prisma.orders.upsert({
    where: { order_number: 'ORD-2026-1002' },
    update: {},
    create: {
      user_id: users[0].id,
      order_number: 'ORD-2026-1002',
      status: 'delivered',
      items: [
        { name: 'iPhone 15 Pro Max 256GB', quantity: 1, price: 144900 },
        { name: 'Apple Care+ Protection', quantity: 1, price: 12900 },
      ],
      total_amount: 157800,
      shipping_address: {
        street: '123 MG Road',
        city: 'Bangalore',
        state: 'Karnataka',
        zip: '560001',
      },
      tracking_number: 'BLUEDART567823',
      carrier: 'Blue Dart',
      estimated_delivery: new Date('2026-02-10T12:00:00Z'),
      actual_delivery: new Date('2026-02-11T10:30:00Z'),
    },
  }));

  // Rahul Verma's orders
  orders.push(await prisma.orders.upsert({
    where: { order_number: 'ORD-2026-1003' },
    update: {},
    create: {
      user_id: users[1].id,
      order_number: 'ORD-2026-1003',
      status: 'processing',
      items: [
        { name: 'Logitech MX Master 3S Mouse', quantity: 1, price: 8995 },
        { name: 'Logitech MX Keys Keyboard', quantity: 1, price: 12495 },
      ],
      total_amount: 21490,
      shipping_address: {
        street: '45 Connaught Place',
        city: 'New Delhi',
        state: 'Delhi',
        zip: '110001',
      },
      estimated_delivery: new Date('2026-02-18T18:00:00Z'),
    },
  }));

  orders.push(await prisma.orders.upsert({
    where: { order_number: 'ORD-2026-1004' },
    update: {},
    create: {
      user_id: users[1].id,
      order_number: 'ORD-2026-1004',
      status: 'shipped',
      items: [
        { name: 'Samsung Galaxy S24 Ultra', quantity: 1, price: 129999 },
        { name: '45W Fast Charger', quantity: 1, price: 3499 },
      ],
      total_amount: 133498,
      shipping_address: {
        street: '45 Connaught Place',
        city: 'New Delhi',
        state: 'Delhi',
        zip: '110001',
      },
      tracking_number: 'FEDEX445566',
      carrier: 'FedEx',
      estimated_delivery: new Date('2026-02-16T16:00:00Z'),
    },
  }));

  // Ananya Gupta's orders
  orders.push(await prisma.orders.upsert({
    where: { order_number: 'ORD-2026-1005' },
    update: {},
    create: {
      user_id: users[2].id,
      order_number: 'ORD-2026-1005',
      status: 'delivered',
      items: [
        { name: 'Kindle Paperwhite 11th Gen', quantity: 1, price: 13999 },
        { name: 'Kindle Fabric Cover', quantity: 1, price: 2499 },
      ],
      total_amount: 16498,
      shipping_address: {
        street: '78 Park Street',
        city: 'Kolkata',
        state: 'West Bengal',
        zip: '700016',
      },
      tracking_number: 'AMAZON998877',
      carrier: 'Amazon Logistics',
      estimated_delivery: new Date('2026-02-08T18:00:00Z'),
      actual_delivery: new Date('2026-02-09T14:20:00Z'),
    },
  }));

  // Vikram Patel's orders
  orders.push(await prisma.orders.upsert({
    where: { order_number: 'ORD-2026-1006' },
    update: {},
    create: {
      user_id: users[3].id,
      order_number: 'ORD-2026-1006',
      status: 'cancelled',
      items: [
        { name: 'MacBook Air M3 15"', quantity: 1, price: 134900 },
      ],
      total_amount: 134900,
      shipping_address: {
        street: '234 SG Highway',
        city: 'Ahmedabad',
        state: 'Gujarat',
        zip: '380015',
      },
    },
  }));

  orders.push(await prisma.orders.upsert({
    where: { order_number: 'ORD-2026-1007' },
    update: {},
    create: {
      user_id: users[3].id,
      order_number: 'ORD-2026-1007',
      status: 'processing',
      items: [
        { name: 'iPad Pro 12.9" M2 256GB', quantity: 1, price: 112900 },
        { name: 'Apple Pencil 2nd Gen', quantity: 1, price: 11900 },
      ],
      total_amount: 124800,
      shipping_address: {
        street: '234 SG Highway',
        city: 'Ahmedabad',
        state: 'Gujarat',
        zip: '380015',
      },
      estimated_delivery: new Date('2026-02-19T18:00:00Z'),
    },
  }));

  // Neha Reddy's orders
  orders.push(await prisma.orders.upsert({
    where: { order_number: 'ORD-2026-1008' },
    update: {},
    create: {
      user_id: users[4].id,
      order_number: 'ORD-2026-1008',
      status: 'shipped',
      items: [
        { name: 'Dell XPS 15 9530', quantity: 1, price: 189990 },
        { name: 'Dell Pro Backpack', quantity: 1, price: 3499 },
      ],
      total_amount: 193489,
      shipping_address: {
        street: '567 Banjara Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        zip: '500034',
      },
      tracking_number: 'DELHIVERY334455',
      carrier: 'Delhivery',
      estimated_delivery: new Date('2026-02-15T18:00:00Z'),
    },
  }));

  // Arjun Malhotra's orders
  orders.push(await prisma.orders.upsert({
    where: { order_number: 'ORD-2026-1009' },
    update: {},
    create: {
      user_id: users[5].id,
      order_number: 'ORD-2026-1009',
      status: 'delivered',
      items: [
        { name: 'Nothing Phone 2a', quantity: 1, price: 23999 },
        { name: 'Nothing Ear 2', quantity: 1, price: 8999 },
      ],
      total_amount: 32998,
      shipping_address: {
        street: '890 Model Town',
        city: 'Chandigarh',
        state: 'Punjab',
        zip: '160022',
      },
      tracking_number: 'ECOM776655',
      carrier: 'Ecom Express',
      estimated_delivery: new Date('2026-02-06T18:00:00Z'),
      actual_delivery: new Date('2026-02-07T11:00:00Z'),
    },
  }));

  // Kavya Krishnan's orders
  orders.push(await prisma.orders.upsert({
    where: { order_number: 'ORD-2026-1010' },
    update: {},
    create: {
      user_id: users[6].id,
      order_number: 'ORD-2026-1010',
      status: 'processing',
      items: [
        { name: 'Sony A7 IV Camera Body', quantity: 1, price: 229990 },
        { name: 'Sony FE 24-70mm f/2.8 GM II', quantity: 1, price: 214990 },
      ],
      total_amount: 444980,
      shipping_address: {
        street: '123 Anna Nagar',
        city: 'Chennai',
        state: 'Tamil Nadu',
        zip: '600002',
      },
      estimated_delivery: new Date('2026-02-20T18:00:00Z'),
    },
  }));

  // Aditya Singh's orders
  orders.push(await prisma.orders.upsert({
    where: { order_number: 'ORD-2026-1011' },
    update: {},
    create: {
      user_id: users[7].id,
      order_number: 'ORD-2026-1011',
      status: 'shipped',
      items: [
        { name: 'PS5 Digital Edition', quantity: 1, price: 44990 },
        { name: 'DualSense Controller', quantity: 2, price: 5990 },
        { name: 'God of War Ragnarok', quantity: 1, price: 4999 },
      ],
      total_amount: 61969,
      shipping_address: {
        street: '456 Linking Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        zip: '400050',
      },
      tracking_number: 'BLUEDART889900',
      carrier: 'Blue Dart',
      estimated_delivery: new Date('2026-02-16T18:00:00Z'),
    },
  }));

  orders.push(await prisma.orders.upsert({
    where: { order_number: 'ORD-2026-1012' },
    update: {},
    create: {
      user_id: users[7].id,
      order_number: 'ORD-2026-1012',
      status: 'delivered',
      items: [
        { name: 'Asus ROG Strix G16', quantity: 1, price: 149990 },
        { name: 'Logitech G502 X Gaming Mouse', quantity: 1, price: 5995 },
      ],
      total_amount: 155985,
      shipping_address: {
        street: '456 Linking Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        zip: '400050',
      },
      tracking_number: 'DTDC112233',
      carrier: 'DTDC',
      estimated_delivery: new Date('2026-02-05T18:00:00Z'),
      actual_delivery: new Date('2026-02-06T09:15:00Z'),
    },
  }));

  console.log(`✅ Created ${orders.length} orders`);

  // Create payments - one invoice for each order (sequential to avoid connection pool issues)
  const payments = [];
  
  console.log('Creating payments...');
  
  // Invoice for ORD-2026-1001
  payments.push(await prisma.payments.upsert({
    where: { invoice_number: 'INV-2026-1001' },
    update: {},
    create: {
      user_id: users[0].id,
      invoice_number: 'INV-2026-1001',
      amount: 30598,
      status: 'paid',
      payment_method: 'UPI - PhonePe',
      transaction_id: 'PHON20260214001',
      description: 'Payment for Order #ORD-2026-1001',
      invoice_date: new Date('2026-02-14T10:30:00Z'),
      paid_date: new Date('2026-02-14T10:31:00Z'),
    },
  }));

  // Invoice for ORD-2026-1002
  payments.push(await prisma.payments.upsert({
    where: { invoice_number: 'INV-2026-1002' },
    update: {},
    create: {
      user_id: users[0].id,
      invoice_number: 'INV-2026-1002',
      amount: 157800,
      status: 'paid',
      payment_method: 'Credit Card - HDFC',
      transaction_id: 'HDFC20260209001',
      description: 'Payment for Order #ORD-2026-1002',
      invoice_date: new Date('2026-02-09T14:00:00Z'),
      paid_date: new Date('2026-02-09T14:01:00Z'),
    },
  }));

  // Invoice for ORD-2026-1003
  payments.push(await prisma.payments.upsert({
    where: { invoice_number: 'INV-2026-1003' },
    update: {},
    create: {
      user_id: users[1].id,
      invoice_number: 'INV-2026-1003',
      amount: 21490,
      status: 'pending',
      payment_method: 'Net Banking - SBI',
      description: 'Payment for Order #ORD-2026-1003',
      invoice_date: new Date('2026-02-14T08:00:00Z'),
      due_date: new Date('2026-02-21T23:59:59Z'),
    },
  }));

  // Invoice for ORD-2026-1004
  payments.push(await prisma.payments.upsert({
    where: { invoice_number: 'INV-2026-1004' },
    update: {},
    create: {
      user_id: users[1].id,
      invoice_number: 'INV-2026-1004',
      amount: 133498,
      status: 'paid',
      payment_method: 'UPI - Google Pay',
      transaction_id: 'GPAY20260213001',
      description: 'Payment for Order #ORD-2026-1004',
      invoice_date: new Date('2026-02-13T16:00:00Z'),
      paid_date: new Date('2026-02-13T16:00:30Z'),
    },
  }));

  // Invoice for ORD-2026-1005
  payments.push(await prisma.payments.upsert({
    where: { invoice_number: 'INV-2026-1005' },
    update: {},
    create: {
      user_id: users[2].id,
      invoice_number: 'INV-2026-1005',
      amount: 16498,
      status: 'paid',
      payment_method: 'Debit Card - Axis',
      transaction_id: 'AXIS20260207001',
      description: 'Payment for Order #ORD-2026-1005',
      invoice_date: new Date('2026-02-07T12:00:00Z'),
      paid_date: new Date('2026-02-07T12:01:00Z'),
    },
  }));

  // Invoice for ORD-2026-1006 (cancelled order - refunded)
  payments.push(await prisma.payments.upsert({
    where: { invoice_number: 'INV-2026-1006' },
    update: {},
    create: {
      user_id: users[3].id,
      invoice_number: 'INV-2026-1006',
      amount: 134900,
      status: 'refunded',
      payment_method: 'Credit Card - ICICI',
      transaction_id: 'ICIC20260212001',
      description: 'Payment for Order #ORD-2026-1006 (Cancelled)',
      invoice_date: new Date('2026-02-12T10:00:00Z'),
      paid_date: new Date('2026-02-12T10:01:00Z'),
      refund_amount: 134900,
      refund_date: new Date('2026-02-13T15:30:00Z'),
      refund_reason: 'Customer requested cancellation within 24 hours',
    },
  }));

  // Invoice for ORD-2026-1007
  payments.push(await prisma.payments.upsert({
    where: { invoice_number: 'INV-2026-1007' },
    update: {},
    create: {
      user_id: users[3].id,
      invoice_number: 'INV-2026-1007',
      amount: 124800,
      status: 'pending',
      payment_method: 'Credit Card - ICICI',
      description: 'Payment for Order #ORD-2026-1007',
      invoice_date: new Date('2026-02-14T11:00:00Z'),
      due_date: new Date('2026-02-21T23:59:59Z'),
    },
  }));

  // Invoice for ORD-2026-1008
  payments.push(await prisma.payments.upsert({
    where: { invoice_number: 'INV-2026-1008' },
    update: {},
    create: {
      user_id: users[4].id,
      invoice_number: 'INV-2026-1008',
      amount: 193489,
      status: 'paid',
      payment_method: 'UPI - Paytm',
      transaction_id: 'PAYT20260212001',
      description: 'Payment for Order #ORD-2026-1008',
      invoice_date: new Date('2026-02-12T14:00:00Z'),
      paid_date: new Date('2026-02-12T14:00:15Z'),
    },
  }));

  // Invoice for ORD-2026-1009
  payments.push(await prisma.payments.upsert({
    where: { invoice_number: 'INV-2026-1009' },
    update: {},
    create: {
      user_id: users[5].id,
      invoice_number: 'INV-2026-1009',
      amount: 32998,
      status: 'refunded',
      payment_method: 'Debit Card - SBI',
      transaction_id: 'SBI20260205001',
      description: 'Payment for Order #ORD-2026-1009 (Partial Refund)',
      invoice_date: new Date('2026-02-05T10:00:00Z'),
      paid_date: new Date('2026-02-05T10:01:00Z'),
      refund_amount: 8999,
      refund_date: new Date('2026-02-10T16:00:00Z'),
      refund_reason: 'Defective earbuds - replaced with new unit',
    },
  }));

  // Invoice for ORD-2026-1010
  payments.push(await prisma.payments.upsert({
    where: { invoice_number: 'INV-2026-1010' },
    update: {},
    create: {
      user_id: users[6].id,
      invoice_number: 'INV-2026-1010',
      amount: 444980,
      status: 'pending',
      payment_method: 'EMI - Bajaj Finserv',
      description: 'Payment for Order #ORD-2026-1010 (12 months EMI)',
      invoice_date: new Date('2026-02-14T09:00:00Z'),
      due_date: new Date('2026-02-28T23:59:59Z'),
    },
  }));

  // Invoice for ORD-2026-1011
  payments.push(await prisma.payments.upsert({
    where: { invoice_number: 'INV-2026-1011' },
    update: {},
    create: {
      user_id: users[7].id,
      invoice_number: 'INV-2026-1011',
      amount: 61969,
      status: 'paid',
      payment_method: 'UPI - PhonePe',
      transaction_id: 'PHON20260213001',
      description: 'Payment for Order #ORD-2026-1011',
      invoice_date: new Date('2026-02-13T18:00:00Z'),
      paid_date: new Date('2026-02-13T18:00:45Z'),
    },
  }));

  // Invoice for ORD-2026-1012
  payments.push(await prisma.payments.upsert({
    where: { invoice_number: 'INV-2026-1012' },
    update: {},
    create: {
      user_id: users[7].id,
      invoice_number: 'INV-2026-1012',
      amount: 155985,
      status: 'paid',
      payment_method: 'Credit Card - HDFC',
      transaction_id: 'HDFC20260204001',
      description: 'Payment for Order #ORD-2026-1012',
      invoice_date: new Date('2026-02-04T12:00:00Z'),
      paid_date: new Date('2026-02-04T12:01:00Z'),
    },
  }));

  console.log(`✅ Created ${payments.length} payments (1:1 with orders)`);

  console.log('🎉 Database seeding completed!');
  console.log('📊 Summary:');
  console.log(`   - ${users.length} users`);
  console.log(`   - ${orders.length} orders`);
  console.log(`   - ${payments.length} invoices`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
