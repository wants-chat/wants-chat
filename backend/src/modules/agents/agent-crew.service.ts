import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AiService } from '../ai/ai.service';
import { AppGateway } from '../../common/gateways/app.gateway';
import {
  AgentCrew,
  AgentDefinition,
  AgentOutput,
  CrewExecution,
  CrewProcess,
  CrewTemplate,
} from './interfaces/agent-crew.interfaces';
import { CreateCrewDto } from './dto/create-crew.dto';

@Injectable()
export class AgentCrewService {
  private readonly logger = new Logger(AgentCrewService.name);

  private readonly templates: CrewTemplate[] = [
    {
      name: 'Research & Write',
      description:
        'A crew that researches a topic, writes an article, and polishes the final output.',
      process: 'sequential',
      agents: [
        {
          name: 'Researcher',
          role: 'Research Specialist',
          systemPrompt:
            'You are a research specialist. Given a topic, produce a comprehensive research summary with key facts, statistics, and insights. Be thorough and cite your reasoning.',
          tools: ['web_search'],
        },
        {
          name: 'Writer',
          role: 'Content Writer',
          systemPrompt:
            'You are a skilled content writer. Using the research provided, compose a well-structured, engaging article. Include an introduction, body sections, and conclusion.',
          tools: ['content'],
        },
        {
          name: 'Editor',
          role: 'Editor & Reviewer',
          systemPrompt:
            'You are a meticulous editor. Review the article for clarity, grammar, factual accuracy, and flow. Provide the final polished version.',
          tools: ['content'],
        },
      ],
    },
    {
      name: 'Code Review',
      description:
        'A crew that analyzes code for issues, suggests fixes, and verifies the corrections.',
      process: 'sequential',
      agents: [
        {
          name: 'Analyzer',
          role: 'Code Analyzer',
          systemPrompt:
            'You are a code analysis expert. Examine the provided code and identify bugs, security vulnerabilities, performance issues, and anti-patterns. List each issue clearly.',
          tools: ['code'],
        },
        {
          name: 'Reviewer',
          role: 'Fix Suggester',
          systemPrompt:
            'You are a senior developer. Given a list of code issues, suggest concrete fixes for each one with corrected code snippets and explanations.',
          tools: ['code'],
        },
        {
          name: 'Verifier',
          role: 'Fix Verifier',
          systemPrompt:
            'You are a QA engineer. Review the suggested fixes and verify they correctly address the original issues without introducing new problems. Provide a final verdict.',
          tools: ['code'],
        },
      ],
    },
    {
      name: 'Business Analysis',
      description:
        'A crew that collects business data, analyzes trends, and produces a strategic report.',
      process: 'sequential',
      agents: [
        {
          name: 'Data Collector',
          role: 'Data Collection Specialist',
          systemPrompt:
            'You are a data collection specialist. Given a business topic or question, gather relevant data points, market information, and competitive intelligence. Present the raw data in an organized format.',
          tools: ['web_search', 'data_analysis'],
        },
        {
          name: 'Analyst',
          role: 'Business Analyst',
          systemPrompt:
            'You are a business analyst. Using the collected data, identify trends, patterns, opportunities, and risks. Provide analytical insights with supporting evidence.',
          tools: ['data_analysis'],
        },
        {
          name: 'Report Writer',
          role: 'Report Writer',
          systemPrompt:
            'You are an executive report writer. Using the analysis provided, compose a professional business report with an executive summary, key findings, recommendations, and next steps.',
          tools: ['content'],
        },
      ],
    },
  ];

  constructor(
    private readonly db: DatabaseService,
    private readonly aiService: AiService,
    private readonly gateway: AppGateway,
  ) {}

  async ensureTables(): Promise<void> {
    try {
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS agent_crews (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT DEFAULT '',
          process VARCHAR(50) NOT NULL DEFAULT 'sequential',
          agents JSONB NOT NULL DEFAULT '[]',
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);

      await this.db.query(`
        CREATE INDEX IF NOT EXISTS idx_agent_crews_user_id ON agent_crews(user_id)
      `);

      await this.db.query(`
        CREATE TABLE IF NOT EXISTS crew_executions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          crew_id UUID NOT NULL REFERENCES agent_crews(id) ON DELETE CASCADE,
          user_id VARCHAR(255) NOT NULL,
          input TEXT NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'pending',
          agent_outputs JSONB NOT NULL DEFAULT '[]',
          final_output TEXT,
          started_at TIMESTAMPTZ DEFAULT NOW(),
          completed_at TIMESTAMPTZ
        )
      `);

      await this.db.query(`
        CREATE INDEX IF NOT EXISTS idx_crew_executions_crew_id ON crew_executions(crew_id)
      `);
      await this.db.query(`
        CREATE INDEX IF NOT EXISTS idx_crew_executions_user_id ON crew_executions(user_id)
      `);

      this.logger.log('Agent crew tables ensured');
    } catch (error) {
      this.logger.warn(`Failed to ensure agent crew tables: ${error.message}`);
    }
  }

  // ============================================
  // CRUD
  // ============================================

  async createCrew(userId: string, dto: CreateCrewDto): Promise<AgentCrew> {
    if (!dto.name || !dto.agents || dto.agents.length === 0) {
      throw new BadRequestException('Crew must have a name and at least one agent');
    }

    if (!['sequential', 'parallel'].includes(dto.process)) {
      throw new BadRequestException('Process must be sequential or parallel');
    }

    for (const agent of dto.agents) {
      if (!agent.name || !agent.role || !agent.systemPrompt) {
        throw new BadRequestException(
          'Each agent must have a name, role, and systemPrompt',
        );
      }
    }

    const crew = await this.db.insert<AgentCrew>('agent_crews', {
      user_id: userId,
      name: dto.name,
      description: dto.description || '',
      process: dto.process,
      agents: JSON.stringify(dto.agents),
      created_at: new Date(),
    });

    return this.transformCrew(crew);
  }

  async listCrews(userId: string): Promise<AgentCrew[]> {
    const crews = await this.db.findMany<AgentCrew>(
      'agent_crews',
      { user_id: userId },
      { orderBy: 'created_at', order: 'DESC' },
    );
    return crews.map((c) => this.transformCrew(c));
  }

  async getCrewById(userId: string, crewId: string): Promise<AgentCrew> {
    const crew = await this.db.findOne<AgentCrew>('agent_crews', { id: crewId });
    if (!crew) {
      throw new NotFoundException('Crew not found');
    }
    if (crew.user_id !== userId) {
      throw new NotFoundException('Crew not found');
    }
    return this.transformCrew(crew);
  }

  // ============================================
  // Templates
  // ============================================

  getTemplates(): CrewTemplate[] {
    return this.templates;
  }

  // ============================================
  // Execution
  // ============================================

  async executeCrew(
    userId: string,
    crewId: string,
    input: string,
  ): Promise<CrewExecution> {
    const crew = await this.getCrewById(userId, crewId);

    // Create execution record
    const execution = await this.db.insert<CrewExecution>('crew_executions', {
      crew_id: crewId,
      user_id: userId,
      input,
      status: 'running',
      agent_outputs: JSON.stringify([]),
      started_at: new Date(),
    });

    const executionId = execution.id;

    // Emit start event
    this.emitToUser(userId, 'crew:execution:started', {
      executionId,
      crewId,
      crewName: crew.name,
      process: crew.process,
      agentCount: crew.agents.length,
    });

    // Run asynchronously
    this.runCrewExecution(userId, crew, executionId, input).catch((err) => {
      this.logger.error(`Crew execution ${executionId} failed: ${err.message}`);
    });

    return this.transformExecution(execution);
  }

  async getCrewResult(userId: string, executionId: string): Promise<CrewExecution> {
    const execution = await this.db.findOne<CrewExecution>('crew_executions', {
      id: executionId,
    });
    if (!execution) {
      throw new NotFoundException('Execution not found');
    }
    if (execution.user_id !== userId) {
      throw new NotFoundException('Execution not found');
    }
    return this.transformExecution(execution);
  }

  // ============================================
  // Private execution logic
  // ============================================

  private async runCrewExecution(
    userId: string,
    crew: AgentCrew,
    executionId: string,
    input: string,
  ): Promise<void> {
    const agentOutputs: AgentOutput[] = [];

    try {
      if (crew.process === 'sequential') {
        await this.runSequential(userId, crew, executionId, input, agentOutputs);
      } else {
        await this.runParallel(userId, crew, executionId, input, agentOutputs);
      }

      // Determine final output
      const finalOutput =
        crew.process === 'sequential'
          ? agentOutputs[agentOutputs.length - 1]?.output || ''
          : this.mergeParallelOutputs(agentOutputs);

      // Update execution as completed
      await this.db.update(
        'crew_executions',
        { id: executionId },
        {
          status: 'completed',
          agent_outputs: JSON.stringify(agentOutputs),
          final_output: finalOutput,
          completed_at: new Date(),
        },
      );

      this.emitToUser(userId, 'crew:execution:completed', {
        executionId,
        finalOutput,
        agentOutputs,
      });
    } catch (error) {
      await this.db.update(
        'crew_executions',
        { id: executionId },
        {
          status: 'failed',
          agent_outputs: JSON.stringify(agentOutputs),
          final_output: `Execution failed: ${error.message}`,
          completed_at: new Date(),
        },
      );

      this.emitToUser(userId, 'crew:execution:failed', {
        executionId,
        error: error.message,
      });
    }
  }

  private async runSequential(
    userId: string,
    crew: AgentCrew,
    executionId: string,
    input: string,
    agentOutputs: AgentOutput[],
  ): Promise<void> {
    let currentInput = input;

    for (let i = 0; i < crew.agents.length; i++) {
      const agent = crew.agents[i];
      const stepStart = new Date();

      this.emitToUser(userId, 'crew:agent:started', {
        executionId,
        agentIndex: i,
        agentName: agent.name,
        agentRole: agent.role,
      });

      const prompt = i === 0
        ? currentInput
        : `Previous agent output:\n\n${currentInput}\n\nOriginal user request: ${input}`;

      const output = await this.aiService.generateText(prompt, {
        systemMessage: agent.systemPrompt,
        temperature: 0.7,
        maxTokens: 4096,
      });

      const stepEnd = new Date();

      const agentOutput: AgentOutput = {
        agentName: agent.name,
        agentRole: agent.role,
        input: currentInput,
        output,
        startedAt: stepStart.toISOString(),
        completedAt: stepEnd.toISOString(),
      };

      agentOutputs.push(agentOutput);
      currentInput = output;

      // Update execution with progress
      await this.db.update(
        'crew_executions',
        { id: executionId },
        { agent_outputs: JSON.stringify(agentOutputs) },
      );

      this.emitToUser(userId, 'crew:agent:completed', {
        executionId,
        agentIndex: i,
        agentName: agent.name,
        agentRole: agent.role,
        output,
      });
    }
  }

  private async runParallel(
    userId: string,
    crew: AgentCrew,
    executionId: string,
    input: string,
    agentOutputs: AgentOutput[],
  ): Promise<void> {
    // Emit start for all agents
    crew.agents.forEach((agent, i) => {
      this.emitToUser(userId, 'crew:agent:started', {
        executionId,
        agentIndex: i,
        agentName: agent.name,
        agentRole: agent.role,
      });
    });

    const results = await Promise.all(
      crew.agents.map(async (agent, i) => {
        const stepStart = new Date();

        const output = await this.aiService.generateText(input, {
          systemMessage: agent.systemPrompt,
          temperature: 0.7,
          maxTokens: 4096,
        });

        const stepEnd = new Date();

        const agentOutput: AgentOutput = {
          agentName: agent.name,
          agentRole: agent.role,
          input,
          output,
          startedAt: stepStart.toISOString(),
          completedAt: stepEnd.toISOString(),
        };

        this.emitToUser(userId, 'crew:agent:completed', {
          executionId,
          agentIndex: i,
          agentName: agent.name,
          agentRole: agent.role,
          output,
        });

        return agentOutput;
      }),
    );

    agentOutputs.push(...results);

    await this.db.update(
      'crew_executions',
      { id: executionId },
      { agent_outputs: JSON.stringify(agentOutputs) },
    );
  }

  private mergeParallelOutputs(outputs: AgentOutput[]): string {
    const sections = outputs.map(
      (o) => `## ${o.agentName} (${o.agentRole})\n\n${o.output}`,
    );
    return sections.join('\n\n---\n\n');
  }

  // ============================================
  // Helpers
  // ============================================

  private emitToUser(userId: string, event: string, data: any): void {
    try {
      this.gateway.server.to(`user:${userId}`).emit(event, {
        ...data,
        timestamp: new Date().toISOString(),
      });
    } catch {
      // WebSocket emission is best-effort
    }
  }

  private transformCrew(crew: any): AgentCrew {
    let agents = crew.agents;
    if (typeof agents === 'string') {
      try {
        agents = JSON.parse(agents);
      } catch {
        agents = [];
      }
    }

    return {
      id: crew.id,
      user_id: crew.user_id,
      name: crew.name,
      description: crew.description || '',
      process: crew.process,
      agents,
      created_at: crew.created_at,
    };
  }

  private transformExecution(execution: any): CrewExecution {
    let agentOutputs = execution.agent_outputs;
    if (typeof agentOutputs === 'string') {
      try {
        agentOutputs = JSON.parse(agentOutputs);
      } catch {
        agentOutputs = [];
      }
    }

    return {
      id: execution.id,
      crew_id: execution.crew_id,
      user_id: execution.user_id,
      input: execution.input,
      status: execution.status,
      agent_outputs: agentOutputs,
      final_output: execution.final_output,
      started_at: execution.started_at,
      completed_at: execution.completed_at,
    };
  }
}
