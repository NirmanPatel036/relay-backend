import { Hono } from 'hono';
import { AgentService } from '../services/agent.service.js';

const agents = new Hono();
const agentService = new AgentService();

// Get list of available agents
agents.get('/', (c) => {
  const agentsList = agentService.getAvailableAgents();
  return c.json({
    agents: agentsList,
    total: agentsList.length,
  });
});

// Get agent capabilities
agents.get('/:type/capabilities', (c) => {
  const agentType = c.req.param('type');

  try {
    const capabilities = agentService.getAgentCapabilities(agentType);
    return c.json({
      agentType,
      capabilities,
    });
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get capabilities',
      },
      404
    );
  }
});

export default agents;
