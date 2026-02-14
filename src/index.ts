import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { errorHandler } from './middleware/error-handler.js';
import { rateLimiter } from './middleware/rate-limiter.js';
import chatRoutes from './routes/chat.routes.js';
import agentRoutes from './routes/agent.routes.js';
import healthRoutes from './routes/health.routes.js';
import userRoutes from './routes/user.routes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use('*', rateLimiter());

// Routes
app.route('/api/chat', chatRoutes);
app.route('/api/agents', agentRoutes);
app.route('/api/user', userRoutes);
app.route('/api', healthRoutes);

// Error handling
app.onError(errorHandler);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

const port = parseInt(process.env.PORT || '3001');

console.log(`🚀 Server starting on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
