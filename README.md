# Relay Backend

AI-powered customer service backend built with Hono, Prisma, and Google Generative AI. Features intelligent agent routing for handling orders, billing, and support inquiries.

## Features

- 🤖 **Multi-Agent System**: Intelligent routing to specialized agents (Orders, Billing, Support)
- 💬 **Conversational AI**: Context-aware conversations powered by Google Gemini
- 🔄 **Real-time Streaming**: Server-sent events for streaming AI responses
- 🗄️ **PostgreSQL Database**: Persistent storage with Prisma ORM
- 🔐 **Supabase Auth Integration**: Seamless authentication with Supabase
- 📊 **Agent Metrics**: Track agent performance and decision-making
- 🚀 **High Performance**: Built on Hono for blazing-fast response times

## Tech Stack

- **Framework**: [Hono](https://hono.dev/) - Ultrafast web framework
- **Database**: PostgreSQL with [Prisma](https://www.prisma.io/) ORM
- **AI**: [Google Gemini](https://ai.google.dev/) via Vercel AI SDK
- **Auth**: [Supabase](https://supabase.com/)
- **Language**: TypeScript
- **Runtime**: Node.js

## Project Structure

```
backend/
├── src/
│   ├── agents/              # AI Agent implementations
│   │   ├── base.agent.ts    # Base agent class
│   │   ├── router.agent.ts  # Routes queries to appropriate agent
│   │   ├── order.agent.ts   # Handles order-related queries
│   │   ├── billing.agent.ts # Handles billing & payment queries
│   │   └── support.agent.ts # Handles general support
│   ├── services/            # Business logic layer
│   │   ├── agent.service.ts
│   │   ├── conversation.service.ts
│   │   ├── user.service.ts
│   │   ├── order.service.ts
│   │   └── payment.service.ts
│   ├── routes/              # API route handlers
│   │   ├── chat.routes.ts   # Chat/messaging endpoints
│   │   ├── agent.routes.ts  # Agent info endpoints
│   │   ├── user.routes.ts   # User management endpoints
│   │   └── health.routes.ts # Health check endpoint
│   ├── middleware/          # Custom middleware
│   │   ├── error-handler.ts
│   │   └── rate-limiter.ts
│   ├── scripts/             # Utility scripts
│   └── index.ts             # Application entry point
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Database seeding script
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL database (or Supabase account)
- Google AI API key

### Installation

1. **Clone the repository and navigate to backend**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your credentials:
   ```env
   # Supabase Configuration
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Database
   DATABASE_URL=your_postgres_connection_string
   DIRECT_URL=your_postgres_direct_connection_string  # Optional

   # Google Generative AI
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key

   # Server
   PORT=3001
   NODE_ENV=development

   # JWT Secret
   JWT_SECRET=your_jwt_secret
   ```

4. **Generate Prisma client**:
   ```bash
   npm run db:generate
   ```

5. **Push database schema**:
   ```bash
   npm run db:push
   ```

6. **Seed the database** (optional):
   ```bash
   npm run db:seed
   ```

7. **Start the development server**:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001`.

## API Endpoints

### Chat & Messaging

#### `POST /api/chat/messages`
Send a message and get AI response.

**Request:**
```json
{
  "conversationId": "uuid",  // optional, creates new if not provided
  "userId": "uuid",
  "message": "Where is my order #8829?",
  "stream": false            // optional, default false
}
```

**Response:**
```json
{
  "conversationId": "uuid",
  "message": {
    "id": "uuid",
    "role": "assistant",
    "content": "Your order #8829 is currently...",
    "agentType": "order",
    "createdAt": "2026-02-15T..."
  },
  "routing": {
    "agentType": "order",
    "reasoning": "Query about order status",
    "confidence": 0.95
  },
  "metadata": {}
}
```

#### `GET /api/chat/conversations/:id`
Get conversation history.

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "title": "Order Inquiry",
  "messages": [...],
  "createdAt": "2026-02-15T...",
  "updatedAt": "2026-02-15T..."
}
```

#### `GET /api/chat/conversations?userId=:userId`
List user conversations.

### User Management

#### `POST /api/user/sync`
Sync Supabase Auth user to database.

**Request:**
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "name": "John Doe"
}
```

#### `GET /api/user/me`
Get current user profile.

**Headers:** `x-user-id: uuid`

#### `GET /api/user/check-sample-data`
Check if user has sample data.

**Headers:** `x-user-id: uuid`

#### `POST /api/user/populate-sample-data`
Populate sample orders and payments for testing.

**Headers:** `x-user-id: uuid`

### Agent Information

#### `GET /api/agents`
List available agents and their capabilities.

**Response:**
```json
{
  "agents": [
    {
      "type": "order",
      "name": "Order Agent",
      "description": "Handles order tracking, status, and modifications"
    },
    ...
  ],
  "total": 3
}
```

#### `GET /api/agents/:type/capabilities`
Get specific agent capabilities.

### Health Check

#### `GET /api/health`
Server health check.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-15T..."
}
```

## Database Schema

### Core Tables

- **users**: User profiles synced from Supabase Auth
- **conversations**: Chat conversations
- **messages**: Individual messages in conversations
- **orders**: Order information and tracking
- **payments**: Payment and invoice records
- **agent_metrics**: Agent performance tracking

### Key Relationships

```
users (1) ─── (N) conversations
conversations (1) ─── (N) messages
users (1) ─── (N) orders
users (1) ─── (N) payments
```

## Agent System

### Router Agent
Intelligently routes queries to the appropriate specialized agent based on:
- Query content analysis
- User intent detection
- Conversation context
- Confidence scoring

### Order Agent
Handles:
- Order status and tracking
- Delivery estimates
- Order modifications
- Returns and cancellations

### Billing Agent
Handles:
- Invoice inquiries
- Payment status
- Refund requests
- Billing history

### Support Agent
Handles:
- General questions
- Account issues
- Product information
- Escalations

## Development

### Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio GUI
npm run db:seed      # Seed database with sample data
```

### Adding a New Agent

1. Create agent file in `src/agents/`:
   ```typescript
   import { BaseAgent } from './base.agent.js';
   
   export class MyAgent extends BaseAgent {
     // Implement agent logic
   }
   ```

2. Register in `agent.service.ts`

3. Update router agent prompts to include new agent

### Database Migrations

When modifying the schema:

1. Update `prisma/schema.prisma`
2. Run `npm run db:push` (dev) or `prisma migrate dev` (prod)
3. Run `npm run db:generate` to update Prisma client

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `DIRECT_URL` | Direct database connection (optional) | No |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI API key | Yes |
| `PORT` | Server port | No (default: 3001) |
| `NODE_ENV` | Environment (development/production) | No |
| `JWT_SECRET` | JWT signing secret | Yes |

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

Error responses follow this format:
```json
{
  "error": "Error message",
  "details": {} // Optional additional details
}
```

## Rate Limiting

- Default: 100 requests per 15 minutes per IP
- Configurable in `middleware/rate-limiter.ts`

## CORS Configuration

Allowed origins:
- `http://localhost:3000`
- `http://localhost:3001`
- `https://relay-agent.vercel.app`

Configurable in `src/index.ts`.

## Troubleshooting

### Foreign Key Constraint Errors

If you encounter `conversations_user_id_fkey` errors:
- The user service automatically creates users when needed
- Ensure frontend syncs users via `POST /api/user/sync` after auth
- The conversation service includes automatic user creation fallback

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check database is accessible
- For Supabase: Use connection pooler URL for serverless
- Enable SSL mode: `?sslmode=require`

### AI API Errors

- Verify `GOOGLE_GENERATIVE_AI_API_KEY` is valid
- Check API quota/limits
- Review AI SDK documentation for model availability

## Production Deployment

### Recommended Setup

1. **Database**: Supabase or managed PostgreSQL
2. **Hosting**: Vercel, Railway, or Render
3. **Environment**: Set all required env variables
4. **Build**: Run `npm run build`
5. **Start**: Run `npm start`

### Performance Tips

- Enable connection pooling for database
- Use Redis for rate limiting (optional)
- Configure proper CORS for production domains
- Enable request compression
- Monitor agent metrics for optimization

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT

---

Built with ❤️ using Hono, Prisma, and Google AI
