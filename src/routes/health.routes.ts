/// <reference types="node" />
import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';

const health = new Hono();
const prisma = new PrismaClient();

health.get('/health', async (c) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return c.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
    });
  } catch (error) {
    return c.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      503
    );
  }
});

export default health;
