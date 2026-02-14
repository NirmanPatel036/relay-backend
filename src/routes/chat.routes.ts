import { Hono } from 'hono';
import { stream } from 'hono/streaming';
import { ConversationService } from '../services/conversation.service.js';
import { AgentService } from '../services/agent.service.js';
import { z } from 'zod';

const chat = new Hono();
const conversationService = new ConversationService();
const agentService = new AgentService();

// Validation schemas
const sendMessageSchema = z.object({
  conversationId: z.string().optional(),
  userId: z.string(),
  message: z.string().min(1),
  stream: z.boolean().optional().default(false),
});

// POST /api/chat/messages - Send a new message
chat.post('/messages', async (c) => {
  try {
    const body = await c.req.json();
    const validated = sendMessageSchema.parse(body);

    let conversationId = validated.conversationId;

    // Create conversation if it doesn't exist
    if (!conversationId) {
      const conversation = await conversationService.createConversation(validated.userId);
      conversationId = conversation.id;
    }

    // Ensure conversationId is defined
    if (!conversationId) {
      return c.json({ error: 'Failed to create conversation' }, 500);
    }

    // Get conversation history for context
    const history = await conversationService.getConversationHistory(conversationId, 10);

    // Add user message to conversation
    await conversationService.addMessage(
      conversationId,
      'user',
      validated.message
    );

    // Check if streaming is requested
    if (validated.stream) {
      return stream(c, async (stream) => {
        // Send typing indicator
        await stream.writeln(JSON.stringify({
          type: 'status',
          status: 'typing',
          agent: 'router',
        }));

        // Process with router agent
        const result = await agentService.processMessage(
          validated.message,
          {
            userId: validated.userId,
            conversationId,
            conversationHistory: history,
          },
          true
        );

        // Send routing information
        await stream.writeln(JSON.stringify({
          type: 'routing',
          agentType: result.agentType,
          reasoning: result.routing.reasoning,
          confidence: result.routing.confidence,
        }));

        // Stream the AI response
        await stream.writeln(JSON.stringify({
          type: 'status',
          status: 'responding',
          agent: result.agentType,
        }));

        let fullContent = '';

        // Stream text chunks
        for await (const chunk of result.response.textStream) {
          fullContent += chunk;
          await stream.writeln(JSON.stringify({
            type: 'chunk',
            content: chunk,
          }));
        }

        // Save assistant message
        await conversationService.addMessage(
          conversationId,
          'assistant',
          fullContent,
          result.agentType,
          result.routing.reasoning,
          result.metadata
        );

        // Send completion
        await stream.writeln(JSON.stringify({
          type: 'done',
          messageId: conversationId,
        }));
      });
    }

    // Non-streaming response
    const result = await agentService.processMessage(
      validated.message,
      {
        userId: validated.userId,
        conversationId,
        conversationHistory: history,
      },
      false
    );

    // Save routing message (reasoning)
    await conversationService.addMessage(
      conversationId,
      'system',
      result.routing.reasoning,
      'router',
      undefined,
      { confidence: result.routing.confidence }
    );

    // Save assistant message
    const assistantMessage = await conversationService.addMessage(
      conversationId,
      'assistant',
      result.response,
      result.agentType,
      result.reasoning,
      result.metadata
    );

    return c.json({
      conversationId,
      message: assistantMessage,
      routing: {
        agentType: result.agentType,
        reasoning: result.routing.reasoning,
        confidence: result.routing.confidence,
      },
      metadata: result.metadata,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Error in sendMessage:', errorMessage);

    if (error instanceof z.ZodError) {
      return c.json(
        {
          error: 'Validation Error',
          details: error.errors,
        },
        400
      );
    }

    return c.json(
      {
        error: errorMessage,
      },
      500
    );
  }
});

// GET /api/chat/conversations/:id - Get conversation history
chat.get('/conversations/:id', async (c) => {
  try {
    const conversationId = c.req.param('id');

    const conversation = await conversationService.getConversation(conversationId);

    if (!conversation) {
      return c.json({ error: 'Conversation not found' }, 404);
    }

    return c.json(conversation);
  } catch (error) {
    console.error('Error getting conversation:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      500
    );
  }
});

// GET /api/chat/conversations - List user conversations
chat.get('/conversations', async (c) => {
  try {
    const userId = c.req.query('userId');

    if (!userId) {
      return c.json({ error: 'userId is required' }, 400);
    }

    const conversations = await conversationService.getUserConversations(userId);

    return c.json({
      conversations,
      total: conversations.length,
    });
  } catch (error) {
    console.error('Error listing conversations:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      500
    );
  }
});

// DELETE /api/chat/conversations/:id - Delete conversation
chat.delete('/conversations/:id', async (c) => {
  try {
    const conversationId = c.req.param('id');

    await conversationService.deleteConversation(conversationId);

    return c.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      500
    );
  }
});

export default chat;
