import { RouterAgent } from '../agents/router.agent.js';
import { SupportAgent } from '../agents/support.agent.js';
import { OrderAgent } from '../agents/order.agent.js';
import { BillingAgent } from '../agents/billing.agent.js';
import { BaseAgent } from '../agents/base.agent.js';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

export class AgentService {
  private routerAgent: RouterAgent;
  private supportAgent: SupportAgent;
  private orderAgent: OrderAgent;
  private billingAgent: BillingAgent;
  private agents: Map<string, BaseAgent>;

  constructor() {
    this.routerAgent = new RouterAgent();
    this.supportAgent = new SupportAgent();
    this.orderAgent = new OrderAgent();
    this.billingAgent = new BillingAgent();

    // Register sub-agents with router
    this.routerAgent.registerAgent('support', this.supportAgent);
    this.routerAgent.registerAgent('order', this.orderAgent);
    this.routerAgent.registerAgent('billing', this.billingAgent);

    // Store agents in map for easy access
    this.agents = new Map<string, BaseAgent>([
      ['router', this.routerAgent],
      ['support', this.supportAgent],
      ['order', this.orderAgent],
      ['billing', this.billingAgent],
    ]);
  }

  async processMessage(
    query: string,
    context: {
      userId: string;
      conversationId: string;
      conversationHistory?: any[];
    },
    stream: boolean = false
  ) {
    const startTime = Date.now();

    try {
      // Step 1: Router analyzes and determines which agent to use
      const routing = await this.routerAgent.routeQuery(query, context);

      console.log(`[Router] Query routed to ${routing.agentType} agent (confidence: ${routing.confidence})`);

      // Step 2: Delegate to appropriate agent
      const response = await this.routerAgent.delegateToAgent(
        routing.agentType,
        query,
        {
          ...context,
          userTier: context.userId ? await this.getUserTier(context.userId) : 'free',
        },
        stream
      );

      // Step 3: Log metrics
      const responseTime = Date.now() - startTime;
      await this.logAgentMetrics({
        agentType: routing.agentType,
        sessionId: context.conversationId,
        intent: routing.agentType,
        confidence: routing.confidence,
        responseTime,
        successful: true,
      });

      return {
        agentType: routing.agentType,
        routing: {
          reasoning: routing.reasoning,
          confidence: routing.confidence,
        },
        response: stream ? response : (response?.content || ''),
        reasoning: stream ? null : (response?.reasoning || ''),
        metadata: {
          responseTime,
          model: 'gemini-2.5-flash',
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Extract error message safely
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Agent Service] Error:`, errorMessage);
      console.error(`[Agent Service] Query:`, query);

      // Log error metrics
      await this.logAgentMetrics({
        agentType: 'router',
        sessionId: context.conversationId,
        intent: 'unknown',
        confidence: 0,
        responseTime,
        successful: false,
        errorMessage,
      });

      // Return a user-friendly error response instead of throwing
      return {
        agentType: 'support',
        routing: {
          reasoning: 'Service temporarily unavailable, defaulting to support agent',
          confidence: 0.5,
        },
        response: "I apologize, but I'm experiencing technical difficulties processing your request at the moment. Please try again in a few moments, or rephrase your question.",
        reasoning: 'Error occurred while processing the request',
        metadata: {
          responseTime,
          error: errorMessage,
        },
      };
    }
  }

  getAvailableAgents() {
    return [
      {
        type: 'support',
        name: 'Support Agent',
        description: 'Handles general support inquiries, FAQs, and troubleshooting',
        icon: 'HelpCircle',
      },
      {
        type: 'order',
        name: 'Order Agent',
        description: 'Handles order status, tracking, and modifications',
        icon: 'Package',
      },
      {
        type: 'billing',
        name: 'Billing Agent',
        description: 'Handles payment issues, refunds, and invoices',
        icon: 'CreditCard',
      },
    ];
  }

  getAgentCapabilities(agentType: string) {
    const agent = this.agents.get(agentType);

    if (!agent) {
      throw new Error(`Agent type '${agentType}' not found`);
    }

    return agent.getCapabilities();
  }

  private async getUserTier(userId: string): Promise<string> {
    try {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { tier: true },
      });

      return user?.tier || 'free';
    } catch (error) {
      return 'free';
    }
  }

  private async logAgentMetrics(data: {
    agentType: string;
    sessionId: string;
    intent: string;
    confidence: number;
    responseTime: number;
    successful: boolean;
    errorMessage?: string;
  }) {
    try {
      await prisma.agent_metrics.create({
        data: {
          id: nanoid(),
          agent_type: data.agentType,
          session_id: data.sessionId,
          intent: data.intent,
          confidence: data.confidence,
          response_time: data.responseTime,
          successful: data.successful,
          error_message: data.errorMessage,
          metadata: {},
        },
      });
    } catch (error) {
      console.error('Failed to log agent metrics:', error);
    }
  }
}
