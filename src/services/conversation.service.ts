import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ConversationService {
  async createConversation(userId: string, title?: string) {
    return prisma.conversations.create({
      data: {
        user_id: userId,
        title: title || 'New Conversation',
      },
    });
  }

  async getConversation(conversationId: string) {
    return prisma.conversations.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { created_at: 'asc' },
        },
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            tier: true,
          },
        },
      },
    });
  }

  async getUserConversations(userId: string, limit: number = 20) {
    return prisma.conversations.findMany({
      where: { user_id: userId },
      include: {
        messages: {
          take: 1,
          orderBy: { created_at: 'desc' },
        },
      },
      orderBy: { updated_at: 'desc' },
      take: limit,
    });
  }

  async deleteConversation(conversationId: string) {
    return prisma.conversations.delete({
      where: { id: conversationId },
    });
  }

  async addMessage(
    conversationId: string,
    role: string,
    content: string,
    agentType?: string,
    reasoning?: string,
    metadata?: any
  ) {
    const message = await prisma.messages.create({
      data: {
        conversation_id: conversationId,
        role,
        content,
        agent_type: agentType,
        reasoning,
        metadata: metadata || {},
      },
    });

    await prisma.conversations.update({
      where: { id: conversationId },
      data: { updated_at: new Date() },
    });

    return message;
  }

  async getConversationHistory(conversationId: string, limit: number = 10) {
    const messages = await prisma.messages.findMany({
      where: { conversation_id: conversationId },
      orderBy: { created_at: 'desc' },
      take: limit,
    });

    // Return plain objects to avoid Prisma metadata
    return messages.reverse().map((msg: any) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      agentType: msg.agent_type,
      reasoning: msg.reasoning,
      createdAt: msg.created_at,
    }));
  }

  async updateConversationTitle(conversationId: string, title: string) {
    return prisma.conversations.update({
      where: { id: conversationId },
      data: { title },
    });
  }
}
