import { BaseAgent, AgentConfig } from './base.agent.js';
import { ConversationService } from '../services/conversation.service.js';

const conversationService = new ConversationService();

export class SupportAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      type: 'support',
      name: 'Support Agent',
      description: 'Handles general support inquiries, FAQs, and troubleshooting',
      systemPrompt: `You are a helpful Support Agent for a customer service platform called Relay.

Your responsibilities:
- Answer general support questions
- Help with account-related issues
- Provide troubleshooting guidance
- Assist with FAQ-type queries
- Guide users on how to use the platform

Be friendly, professional, and concise. Always aim to solve the customer's problem efficiently.
If you need information from conversation history, use the available tools.`,
      tools: [
        {
          name: 'query_conversation_history',
          description: 'Retrieves past conversations to provide context',
          execute: async (params: { conversationId: string; limit?: number }) => {
            return conversationService.getConversationHistory(
              params.conversationId,
              params.limit || 10
            );
          },
        },
      ],
    };

    super(config);
  }

  protected generateReasoning(query: string, _response: string): string {
    const hasQuestion = query.includes('?') || query.toLowerCase().includes('how');
    const isIssue = query.toLowerCase().includes('issue') || query.toLowerCase().includes('problem');

    if (hasQuestion) {
      return 'Identified as a support question. Searching knowledge base and providing step-by-step guidance.';
    } else if (isIssue) {
      return 'Detected troubleshooting request. Analyzing issue and providing solution steps.';
    }

    return 'Processing general support inquiry. Providing relevant assistance and resources.';
  }
}
