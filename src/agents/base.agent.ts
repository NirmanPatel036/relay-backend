import { google } from '@ai-sdk/google';
import { generateText, streamText, tool } from 'ai';
import { z } from 'zod';

export interface AgentTool {
  name: string;
  description: string;
  parameters?: Record<string, { type: string; description: string; required?: boolean }>;
  execute: (params: any) => Promise<any>;
}

export interface AgentConfig {
  type: string;
  name: string;
  description: string;
  systemPrompt: string;
  tools: AgentTool[];
}

export class BaseAgent {
  protected config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  async processQuery(
    query: string,
    context: any,
    stream: boolean = false
  ): Promise<any> {
    // Safely stringify context, avoiding circular references and metadata
    let contextString: string;
    try {
      // Create a clean copy of context without internal Prisma/Node metadata
      const cleanContext = this.sanitizeContext(context);
      contextString = JSON.stringify(cleanContext, null, 2);
    } catch (err) {
      contextString = 'Context unavailable due to serialization error';
    }

    const systemPrompt = `${this.config.systemPrompt}

Available context:
${contextString}

When you need to fetch specific information about orders, invoices, or user data, use the available tools by calling them directly. The system will execute the tools and provide you with the results.

Provide clear, helpful responses in plain text format. Be conversational and professional. Never output code or technical tool syntax - just have a natural conversation.`;

    // Convert AgentTools to AI SDK tool format
    const aiTools = this.config.tools.length > 0 ? this.convertToolsToAISDK() : undefined;

    try {
      if (stream) {
        return streamText({
          model: google('gemini-2.5-flash'),
          system: systemPrompt,
          prompt: query,
          tools: aiTools,
          temperature: 0.7,
          maxTokens: 1000,
          maxRetries: 2,
        });
      }

      const response = await generateText({
        model: google('gemini-2.5-flash'),
        system: systemPrompt,
        prompt: query,
        tools: aiTools,
        maxSteps: 5, // Allow multiple tool calls if needed
        temperature: 0.7,
        maxTokens: 1000,
        maxRetries: 2,
      });

      // Extract only the text to avoid circular reference issues
      const textContent = response.text || '';

      return {
        content: textContent,
        reasoning: this.generateReasoning(query, textContent),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[${this.config.name}] Error processing query:`, errorMessage);
      console.error(`[${this.config.name}] Query:`, query);
      console.error(`[${this.config.name}] Context keys:`, Object.keys(context || {}));
      
      throw error;
    }
  }

  private convertToolsToAISDK(): Record<string, any> {
    const aiTools: Record<string, any> = {};

    for (const agentTool of this.config.tools) {
      // Create a zod schema based on the tool parameters
      const paramSchema: Record<string, any> = {};
      
      if (agentTool.parameters) {
        for (const [key, param] of Object.entries(agentTool.parameters)) {
          if (param.type === 'string') {
            paramSchema[key] = z.string().describe(param.description);
          } else if (param.type === 'number') {
            paramSchema[key] = z.number().describe(param.description);
          } else if (param.type === 'boolean') {
            paramSchema[key] = z.boolean().describe(param.description);
          }

          if (!param.required) {
            paramSchema[key] = paramSchema[key].optional();
          }
        }
      } else {
        // Default schema for orderNumber/invoiceNumber/userId
        paramSchema.orderNumber = z.string().describe('Order number').optional();
        paramSchema.invoiceNumber = z.string().describe('Invoice number').optional();
        paramSchema.userId = z.string().describe('User ID').optional();
        paramSchema.limit = z.number().describe('Limit results').optional();
      }

      aiTools[agentTool.name] = tool({
        description: agentTool.description,
        parameters: z.object(paramSchema),
        execute: async (params: any) => {
          try {
            const result = await agentTool.execute(params);
            return result;
          } catch (error) {
            console.error(`Tool ${agentTool.name} execution error:`, error);
            return {
              error: error instanceof Error ? error.message : 'Tool execution failed',
            };
          }
        },
      });
    }

    return aiTools;
  }

  private sanitizeContext(context: any): any {
    if (!context || typeof context !== 'object') {
      return context;
    }

    const seen = new WeakSet();

    const sanitize = (obj: any): any => {
      if (obj === null || typeof obj !== 'object') {
        return obj;
      }

      // Prevent circular references
      if (seen.has(obj)) {
        return '[Circular]';
      }
      seen.add(obj);

      // Handle arrays
      if (Array.isArray(obj)) {
        return obj.map(item => sanitize(item));
      }

      // Filter out unwanted properties and create clean object
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        // Skip internal Prisma/Node properties
        if (key.startsWith('_') || key.startsWith('$')) {
          continue;
        }
        // Skip functions
        if (typeof value === 'function') {
          continue;
        }
        // Skip symbol keys
        if (typeof key === 'symbol') {
          continue;
        }
        cleaned[key] = sanitize(value);
      }

      return cleaned;
    };

    return sanitize(context);
  }

  protected generateReasoning(_query: string, _response: string): string {
    return `${this.config.name} analyzed the query and generated a response based on available context and tools.`;
  }

  getCapabilities() {
    return {
      name: this.config.name,
      type: this.config.type,
      description: this.config.description,
      tools: this.config.tools.map(t => ({
        name: t.name,
        description: t.description,
      })),
    };
  }
}
