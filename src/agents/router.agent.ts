import { BaseAgent, AgentConfig } from './base.agent.js';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export class RouterAgent extends BaseAgent {
  private subAgents: Map<string, BaseAgent> = new Map();

  constructor() {
    const config: AgentConfig = {
      type: 'router',
      name: 'Router Agent',
      description: 'Analyzes queries and routes to appropriate specialized agents',
      systemPrompt: `You are a Router Agent responsible for analyzing customer support queries and determining which specialized agent should handle them.

Available agents:
- Support Agent: Handles general support inquiries, FAQs, troubleshooting, account questions, PASSWORD RESETS, login issues, setup help, technical problems, how-to questions
- Order Agent: Handles order status, tracking, modifications, cancellations, delivery issues, shipping questions (look for order numbers like #1234 or INV-*)
- Billing Agent: Handles payment issues, refunds, invoices, subscription queries, pricing questions, payment method changes, billing disputes

Analyze the user's query and respond with ONLY the agent type that should handle it.
Respond with exactly one of: support, order, billing

Key routing rules:
- Password/login/account access issues → support
- Order numbers (#1234) or tracking → order
- Invoice numbers (INV-*) or payment issues → billing
- General questions or how-to → support

If the query is ambiguous or could fit multiple categories, choose the most relevant one.`,
      tools: [],
    };

    super(config);
  }

  registerAgent(type: string, agent: BaseAgent) {
    this.subAgents.set(type, agent);
  }

  async routeQuery(query: string, context: any): Promise<{
    agentType: string;
    reasoning: string;
    confidence: number;
  }> {
    try {
      const response = await generateText({
        model: google('gemini-2.5-flash'),
        system: this.config.systemPrompt,
        prompt: `Query: "${query}"
      
Previous conversation context: ${context.conversationHistory ? 
  context.conversationHistory.slice(-3).map((m: any) => `${m.role}: ${m.content}`).join('\n') 
  : 'None'}

Which agent should handle this? Respond with only: support, order, or billing`,
        temperature: 0.3,
        maxTokens: 50,
        maxRetries: 2,
      });

      // Extract only the text to avoid circular reference issues
      const agentType = (response.text || 'support').toLowerCase().trim();
      
      // Validate and default to support agent
      const validTypes = ['support', 'order', 'billing'];
      const selectedType = validTypes.includes(agentType) ? agentType : 'support';

      const reasoning = this.generateRoutingReasoning(query, selectedType);
      const confidence = this.calculateConfidence(query, selectedType);

      return {
        agentType: selectedType,
        reasoning,
        confidence,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Router] Error routing query:', errorMessage);
      console.error('[Router] Full error:', error);
      
      // Default to support agent on error
      return {
        agentType: 'support',
        reasoning: 'Routing to support agent for general inquiry assistance',
        confidence: 0.6,
      };
    }
  }

  private generateRoutingReasoning(_query: string, agentType: string): string {
    const agentNames: Record<string, string> = {
      order: 'Order',
      billing: 'Billing',
      support: 'Support',
    };

    return `Routing to ${agentNames[agentType] || 'Support'} agent for specialized handling.`;
  }

  private calculateConfidence(query: string, agentType: string): number {
    const keywords: Record<string, string[]> = {
      order: ['order', 'track', 'delivery', 'shipped', 'package', 'shipping', '#'],
      billing: ['payment', 'invoice', 'refund', 'charge', 'subscription', 'billing', 'price', 'paid', 'inv-'],
      support: ['help', 'how', 'issue', 'problem', 'account', 'setup', 'question', 'password', 'reset', 'login', 'access', 'sign in', 'authenticate'],
    };

    const queryLower = query.toLowerCase();
    const matches = keywords[agentType]?.filter(k => queryLower.includes(k)).length || 0;
    const totalWords = query.split(' ').length;

    const confidence = Math.min(0.95, 0.5 + (matches / totalWords) * 0.45);
    return Math.round(confidence * 100) / 100;
  }

  async delegateToAgent(
    agentType: string,
    query: string,
    context: any,
    stream: boolean = false
  ): Promise<any> {
    const agent = this.subAgents.get(agentType);

    if (!agent) {
      throw new Error(`Agent type '${agentType}' not found`);
    }

    return agent.processQuery(query, context, stream);
  }
}
