import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException, ConflictException, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AiService } from '../ai/ai.service';
import { McpClientService } from '../mcp/mcp-client.service';
import { AppGateway } from '../../common/gateways/app.gateway';
import {
  AutonomousTask,
  TaskStatus,
  StepStatus,
  TaskPlan,
  TaskStep,
  TaskStepPlan,
  TaskProgress,
  TaskError,
  TaskConfig,
} from './interfaces';
import {
  AutonomousTaskEntity,
  InsertAutonomousTask,
  UpdateAutonomousTask,
} from './interfaces';
import { allTools, searchTools, ToolData } from '../../data/tools-registry';
import { v4 as uuidv4 } from 'uuid';

const MAX_STEPS = 20;
const STEP_TIMEOUT_MS = 60_000;

interface StepResult {
  stepNumber: number;
  status: StepStatus;
  output?: Record<string, any>;
  error?: string;
  durationMs?: number;
}

@Injectable()
export class AutonomousAgentService implements OnModuleInit {
  private readonly logger = new Logger(AutonomousAgentService.name);

  /** Track running tasks so we can cancel them */
  private readonly runningTasks = new Map<string, { cancelled: boolean; paused: boolean }>();

  constructor(
    private readonly db: DatabaseService,
    private readonly ai: AiService,
    private readonly mcpClient: McpClientService,
    private readonly gateway: AppGateway,
  ) {}

  async onModuleInit(): Promise<void> {
    // Crash-recovery: any task left in 'executing' belonged to a previous
    // process that died mid-run. Its in-memory handle is gone, so mark
    // those tasks 'paused' so the user can explicitly resume them.
    try {
      const result = await this.db.query<{ id: string }>(
        `UPDATE autonomous_tasks
         SET status = 'paused', updated_at = NOW()
         WHERE status = 'executing'
         RETURNING id`,
      );
      if (result.rowCount && result.rowCount > 0) {
        this.logger.warn(
          `Reset ${result.rowCount} stuck 'executing' task(s) to 'paused' on startup: ${result.rows.map((r) => r.id).join(', ')}`,
        );
      }
    } catch (error: any) {
      this.logger.warn(`Stuck-task sweep skipped: ${error.message}`);
    }
  }

  // ================================================================
  // CREATE TASK — parse goal, generate plan via AI
  // ================================================================

  async createTask(userId: string, goal: string): Promise<AutonomousTask> {
    this.logger.log(`Creating task for user ${userId}: "${goal.slice(0, 80)}..."`);

    const taskId = uuidv4();
    const now = new Date().toISOString();

    // Insert with status=planning
    const entity: InsertAutonomousTask = {
      id: taskId,
      user_id: userId,
      task_type: 'composite',
      title: goal.length > 120 ? goal.slice(0, 117) + '...' : goal,
      description: goal,
      input: { goal },
      config: { continueOnError: false },
      status: 'planning',
      progress: { currentStep: 0, totalSteps: 0, phase: 'planning', message: 'Generating plan...', percentage: 0, stepsCompleted: 0, stepsFailed: 0 },
      priority: 5,
      result: undefined,
      error: undefined,
      retry_count: 0,
      max_retries: 1,
      timeout_seconds: 600,
      max_steps: MAX_STEPS,
      tokens_used: 0,
      cost_cents: 0,
      created_at: now,
      updated_at: now,
    };

    await this.db.insert('autonomous_tasks', entity);

    // Generate plan via AI
    let plan: TaskPlan;
    try {
      plan = await this.generatePlan(goal);
    } catch (err) {
      await this.db.update('autonomous_tasks', { id: taskId }, {
        status: 'failed',
        error: { code: 'PLANNING_FAILED', message: err.message, retryable: true, timestamp: new Date().toISOString() },
        updated_at: new Date().toISOString(),
      } as UpdateAutonomousTask);
      throw new BadRequestException(`Failed to generate plan: ${err.message}`);
    }

    // Persist the plan
    const totalSteps = plan.steps.length;
    await this.db.update('autonomous_tasks', { id: taskId }, {
      status: 'planned' as any,
      plan: plan as any,
      progress: { currentStep: 0, totalSteps, phase: 'planned', message: 'Plan ready for approval', percentage: 0, stepsCompleted: 0, stepsFailed: 0 },
      updated_at: new Date().toISOString(),
    } as UpdateAutonomousTask);

    // Also insert individual step rows
    for (const step of plan.steps) {
      await this.db.insert('task_steps', {
        id: step.id,
        task_id: taskId,
        step_number: step.stepNumber,
        name: step.name,
        description: step.description || '',
        agent_type: step.agentType,
        action: step.action,
        input: step.input,
        dependencies: [],
        status: 'pending',
        retry_count: 0,
        max_retries: 1,
      });
    }

    const task = await this.getTaskEntity(taskId);
    return this.transformTask(task);
  }

  // ================================================================
  // EXECUTE TASK — step-by-step with tool resolution
  // ================================================================

  async executeTask(taskId: string, userId: string): Promise<AutonomousTask> {
    const task = await this.getTaskEntity(taskId);
    if (!task) throw new NotFoundException('Task not found');
    if (task.user_id !== userId) throw new ForbiddenException('Not your task');

    const validStartStatuses = ['planned', 'paused'];
    if (!validStartStatuses.includes(task.status)) {
      throw new BadRequestException(`Cannot execute task in status "${task.status}". Must be planned or paused.`);
    }

    const plan: TaskPlan = task.plan as any;
    if (!plan || !plan.steps || plan.steps.length === 0) {
      throw new BadRequestException('Task has no plan');
    }

    // Atomic lock: only transition to 'executing' if still in a valid
    // start status. Two concurrent executeTask() calls will otherwise
    // both pass the status check above and fire runSteps twice for the
    // same task. rowCount === 0 means another caller won the race.
    const lockResult = await this.db.query(
      `UPDATE autonomous_tasks
       SET status = 'executing',
           started_at = COALESCE(started_at, NOW()),
           updated_at = NOW()
       WHERE id = $1 AND status = ANY($2::text[])
       RETURNING id`,
      [taskId, validStartStatuses],
    );
    if (!lockResult.rowCount) {
      throw new ConflictException('Task is already executing or its status changed');
    }

    // Set up control handle (safe now — we own the task)
    this.runningTasks.set(taskId, { cancelled: false, paused: false });

    // Execute asynchronously
    this.runSteps(taskId, userId, plan).catch((err) => {
      this.logger.error(`Task ${taskId} execution crashed: ${err.message}`, err.stack);
    });

    // Return immediately with current state
    const updated = await this.getTaskEntity(taskId);
    return this.transformTask(updated);
  }

  // ================================================================
  // GET TASK STATUS
  // ================================================================

  async getTaskStatus(taskId: string, userId: string): Promise<AutonomousTask> {
    const task = await this.getTaskEntity(taskId);
    if (!task) throw new NotFoundException('Task not found');
    if (task.user_id !== userId) throw new ForbiddenException('Not your task');

    // Fetch step results
    const steps = await this.db.findMany('task_steps', { task_id: taskId }, { orderBy: 'step_number', order: 'ASC' });

    const transformed = this.transformTask(task);
    transformed.result = {
      ...transformed.result,
      steps: steps.map((s: any) => ({
        stepNumber: s.step_number,
        name: s.name,
        status: s.status,
        output: s.output,
        error: s.error,
        durationMs: s.duration_ms,
      })),
    };
    return transformed;
  }

  // ================================================================
  // LIST TASKS
  // ================================================================

  async listTasks(userId: string): Promise<AutonomousTask[]> {
    const tasks = await this.db.findMany('autonomous_tasks', { user_id: userId }, {
      orderBy: 'created_at',
      order: 'DESC',
      limit: 50,
    });
    return tasks.map((t: any) => this.transformTask(t));
  }

  // ================================================================
  // CANCEL TASK
  // ================================================================

  async cancelTask(taskId: string, userId: string): Promise<AutonomousTask> {
    const task = await this.getTaskEntity(taskId);
    if (!task) throw new NotFoundException('Task not found');
    if (task.user_id !== userId) throw new ForbiddenException('Not your task');

    const cancellableStatuses = ['planning', 'planned', 'executing', 'paused', 'queued'];
    if (!cancellableStatuses.includes(task.status)) {
      throw new BadRequestException(`Cannot cancel task in status "${task.status}"`);
    }

    // Signal cancellation to running loop
    const handle = this.runningTasks.get(taskId);
    if (handle) {
      handle.cancelled = true;
    }

    await this.db.update('autonomous_tasks', { id: taskId }, {
      status: 'cancelled',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as UpdateAutonomousTask);

    this.emitEvent(userId, 'agent:task:cancelled', { taskId });

    const updated = await this.getTaskEntity(taskId);
    return this.transformTask(updated);
  }

  // ================================================================
  // PRIVATE — AI Plan Generation
  // ================================================================

  private async generatePlan(goal: string): Promise<TaskPlan> {
    // Gather available tool names for the prompt
    const toolSummaries = allTools.slice(0, 200).map((t: ToolData) => `- ${t.id}: ${t.title} (${t.category})`).join('\n');

    // Also list MCP tools if available
    let mcpToolSummaries = '';
    try {
      const mcpTools = await this.mcpClient.listTools();
      if (mcpTools.length > 0) {
        mcpToolSummaries = '\n\nMCP Tools:\n' + mcpTools.map(t => `- mcp:${t.serverName}/${t.name}: ${t.description || 'No description'}`).join('\n');
      }
    } catch {
      // MCP not available — that's fine
    }

    const systemMessage = `You are a task planning AI. Given a user's goal, break it down into an ordered list of concrete steps.
Each step should reference a tool or action. Available tools include:
${toolSummaries}${mcpToolSummaries}

If no specific tool matches, use action "ai_generate" (for text generation) or "ai_analyze" (for analysis).

Rules:
- Maximum ${MAX_STEPS} steps
- Each step must have: id (uuid), stepNumber (1-based), name (short), description, agentType (one of: llm, api, browser, document, data, custom), action (tool id or action name), input (object with relevant params)
- Steps should be in dependency order
- Estimate total duration in seconds

Respond with ONLY valid JSON matching this schema:
{
  "steps": [{ "id": "uuid", "stepNumber": 1, "name": "...", "description": "...", "agentType": "llm", "action": "tool_id_or_action", "input": {} }],
  "dependencies": {},
  "estimatedDuration": 60,
  "resources": []
}`;

    const response = await this.ai.generateText(
      `Break down this goal into steps: "${goal}"`,
      {
        systemMessage,
        responseFormat: 'json_object',
        temperature: 0.3,
        maxTokens: 4096,
      },
    );

    let parsed: any;
    try {
      parsed = JSON.parse(response);
    } catch {
      throw new BadRequestException('AI returned invalid JSON for plan');
    }

    // Validate and cap steps
    if (!parsed.steps || !Array.isArray(parsed.steps)) {
      throw new BadRequestException('Plan missing steps array');
    }

    if (parsed.steps.length > MAX_STEPS) {
      parsed.steps = parsed.steps.slice(0, MAX_STEPS);
    }

    // Ensure each step has an id
    const plan: TaskPlan = {
      steps: parsed.steps.map((s: any, idx: number) => ({
        id: s.id || uuidv4(),
        stepNumber: idx + 1,
        name: s.name || `Step ${idx + 1}`,
        description: s.description || '',
        agentType: s.agentType || 'llm',
        action: s.action || 'ai_generate',
        input: s.input || {},
        estimatedDuration: s.estimatedDuration,
      })) as TaskStepPlan[],
      dependencies: parsed.dependencies || {},
      estimatedDuration: parsed.estimatedDuration || 60,
      resources: parsed.resources || [],
    };

    // Validate no cyclic dependencies (simple check)
    this.validateDependencies(plan);

    return plan;
  }

  private validateDependencies(plan: TaskPlan): void {
    const stepIds = new Set(plan.steps.map(s => s.id));
    for (const [stepId, deps] of Object.entries(plan.dependencies)) {
      if (!stepIds.has(stepId)) continue;
      for (const dep of deps) {
        if (!stepIds.has(dep)) {
          this.logger.warn(`Dependency ${dep} not found for step ${stepId}, removing`);
        }
      }
    }
    // Simple cycle detection via topological sort attempt
    const visited = new Set<string>();
    const inStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      if (inStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;
      visited.add(nodeId);
      inStack.add(nodeId);
      for (const dep of (plan.dependencies[nodeId] || [])) {
        if (hasCycle(dep)) return true;
      }
      inStack.delete(nodeId);
      return false;
    };

    for (const step of plan.steps) {
      if (hasCycle(step.id)) {
        this.logger.warn('Cyclic dependency detected in plan, clearing dependencies');
        plan.dependencies = {};
        break;
      }
    }
  }

  // ================================================================
  // PRIVATE — Step Execution Loop
  // ================================================================

  private async runSteps(taskId: string, userId: string, plan: TaskPlan): Promise<void> {
    const handle = this.runningTasks.get(taskId);
    const totalSteps = plan.steps.length;
    const stepResults: StepResult[] = [];

    for (let i = 0; i < totalSteps; i++) {
      // Check cancellation / pause
      if (handle?.cancelled) {
        this.logger.log(`Task ${taskId} cancelled at step ${i + 1}`);
        return;
      }
      if (handle?.paused) {
        await this.db.update('autonomous_tasks', { id: taskId }, {
          status: 'paused',
          progress: { currentStep: i, totalSteps, phase: 'paused', message: `Paused at step ${i + 1}`, percentage: Math.round((i / totalSteps) * 100), stepsCompleted: stepResults.filter(r => r.status === 'completed').length, stepsFailed: stepResults.filter(r => r.status === 'failed').length },
          updated_at: new Date().toISOString(),
        } as UpdateAutonomousTask);
        return;
      }

      const stepPlan = plan.steps[i];

      // Emit step started
      this.emitEvent(userId, 'agent:step:started', {
        taskId,
        stepNumber: i + 1,
        totalSteps,
        name: stepPlan.name,
        action: stepPlan.action,
      });

      // Update progress
      await this.db.update('autonomous_tasks', { id: taskId }, {
        status: 'executing',
        progress: { currentStep: i + 1, totalSteps, phase: 'executing', message: `Running: ${stepPlan.name}`, percentage: Math.round((i / totalSteps) * 100), stepsCompleted: stepResults.filter(r => r.status === 'completed').length, stepsFailed: stepResults.filter(r => r.status === 'failed').length },
        updated_at: new Date().toISOString(),
      } as UpdateAutonomousTask);

      // Update step row
      await this.db.update('task_steps', { id: stepPlan.id }, {
        status: 'running',
        started_at: new Date().toISOString(),
      });

      const startTime = Date.now();
      let result: StepResult;

      try {
        const output = await this.executeStep(stepPlan, stepResults, userId);
        const durationMs = Date.now() - startTime;
        result = { stepNumber: i + 1, status: 'completed', output, durationMs };

        await this.db.update('task_steps', { id: stepPlan.id }, {
          status: 'completed',
          output,
          completed_at: new Date().toISOString(),
          duration_ms: durationMs,
        });
      } catch (err) {
        const durationMs = Date.now() - startTime;
        result = { stepNumber: i + 1, status: 'failed', error: err.message, durationMs };

        await this.db.update('task_steps', { id: stepPlan.id }, {
          status: 'failed',
          error: { code: 'STEP_FAILED', message: err.message, retryable: false, timestamp: new Date().toISOString() },
          completed_at: new Date().toISOString(),
          duration_ms: durationMs,
        });

        this.logger.error(`Step ${i + 1} failed for task ${taskId}: ${err.message}`);
      }

      stepResults.push(result);

      // Emit step completed
      this.emitEvent(userId, 'agent:step:completed', {
        taskId,
        stepNumber: i + 1,
        totalSteps,
        status: result.status,
        output: result.output,
        error: result.error,
        durationMs: result.durationMs,
      });

      // Abort on failure unless continueOnError
      if (result.status === 'failed') {
        const taskEntity = await this.getTaskEntity(taskId);
        const config: TaskConfig = (taskEntity?.config as any) || {};
        if (!config.continueOnError) {
          await this.db.update('autonomous_tasks', { id: taskId }, {
            status: 'failed',
            error: { code: 'STEP_FAILED', message: `Step ${i + 1} failed: ${result.error}`, retryable: true, failedStep: stepPlan.id, timestamp: new Date().toISOString() },
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as UpdateAutonomousTask);

          this.emitEvent(userId, 'agent:task:failed', {
            taskId,
            error: result.error,
            failedStep: i + 1,
          });

          this.runningTasks.delete(taskId);
          return;
        }
      }
    }

    // All steps done
    const completedCount = stepResults.filter(r => r.status === 'completed').length;
    const failedCount = stepResults.filter(r => r.status === 'failed').length;

    await this.db.update('autonomous_tasks', { id: taskId }, {
      status: 'completed' as TaskStatus,
      progress: { currentStep: totalSteps, totalSteps, phase: 'completed', message: 'All steps completed', percentage: 100, stepsCompleted: completedCount, stepsFailed: failedCount },
      result: { stepResults, summary: `Completed ${completedCount}/${totalSteps} steps` },
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as UpdateAutonomousTask);

    this.emitEvent(userId, 'agent:task:completed', {
      taskId,
      totalSteps,
      completedSteps: completedCount,
      failedSteps: failedCount,
    });

    this.runningTasks.delete(taskId);
    this.logger.log(`Task ${taskId} completed: ${completedCount}/${totalSteps} steps succeeded`);
  }

  // ================================================================
  // PRIVATE — Execute a Single Step
  // ================================================================

  private async executeStep(
    stepPlan: TaskStepPlan,
    previousResults: StepResult[],
    userId: string,
  ): Promise<Record<string, any>> {
    // Build context from previous results
    const contextSummary = previousResults
      .filter(r => r.status === 'completed' && r.output)
      .map(r => `Step ${r.stepNumber}: ${JSON.stringify(r.output).slice(0, 500)}`)
      .join('\n');

    const action = stepPlan.action;

    // Wrap with timeout
    return this.withTimeout(async () => {
      // 1. Check MCP tools
      if (action.startsWith('mcp:')) {
        return this.executeMcpTool(action, stepPlan.input);
      }

      // 2. Check pre-built tools from the registry
      const matchedTool = this.matchTool(action);
      if (matchedTool) {
        return this.executeRegistryTool(matchedTool, stepPlan, contextSummary, userId);
      }

      // 3. Fallback to AI generation / analysis
      return this.executeAiAction(action, stepPlan, contextSummary, userId);
    }, STEP_TIMEOUT_MS);
  }

  private async executeMcpTool(action: string, input: Record<string, any>): Promise<Record<string, any>> {
    // action format: "mcp:serverName/toolName"
    const withoutPrefix = action.replace('mcp:', '');
    const slashIdx = withoutPrefix.indexOf('/');
    if (slashIdx === -1) {
      throw new BadRequestException(`Invalid MCP action format: ${action}. Expected mcp:server/tool`);
    }
    const serverName = withoutPrefix.slice(0, slashIdx);
    const toolName = withoutPrefix.slice(slashIdx + 1);

    this.logger.log(`Executing MCP tool: ${serverName}/${toolName}`);
    const result = await this.mcpClient.callTool(serverName, toolName, input);
    return { source: 'mcp', serverName, toolName, result };
  }

  private matchTool(action: string): ToolData | null {
    // Direct ID match
    const tools = searchTools(action);
    if (tools.length > 0) {
      return tools[0];
    }
    return null;
  }

  private async executeRegistryTool(
    tool: ToolData,
    stepPlan: TaskStepPlan,
    contextSummary: string,
    userId: string,
  ): Promise<Record<string, any>> {
    // Pre-built tools are React frontend components. The agent simulates their
    // usage by asking the AI to produce the expected output.
    this.logger.log(`Simulating registry tool: ${tool.id} (${tool.title})`);

    const prompt = `You are executing the tool "${tool.title}" (${tool.description}).
Step: ${stepPlan.name} — ${stepPlan.description || ''}
Input: ${JSON.stringify(stepPlan.input)}
${contextSummary ? `Previous step results:\n${contextSummary}` : ''}

Produce the realistic output that this tool would generate. Return valid JSON with the result.`;

    const response = await this.ai.generateText(prompt, {
      systemMessage: 'You are a tool execution simulator. Return only valid JSON with the tool output.',
      responseFormat: 'json_object',
      temperature: 0.4,
      maxTokens: 2048,
      userId,
    });

    try {
      const parsed = JSON.parse(response);
      return { source: 'registry_tool', toolId: tool.id, toolTitle: tool.title, result: parsed };
    } catch {
      return { source: 'registry_tool', toolId: tool.id, toolTitle: tool.title, result: { text: response } };
    }
  }

  private async executeAiAction(
    action: string,
    stepPlan: TaskStepPlan,
    contextSummary: string,
    userId: string,
  ): Promise<Record<string, any>> {
    this.logger.log(`Executing AI action: ${action} for step "${stepPlan.name}"`);

    const prompt = `You are executing this step of an autonomous task:
Step: ${stepPlan.name}
Description: ${stepPlan.description || 'No description'}
Action: ${action}
Input: ${JSON.stringify(stepPlan.input)}
${contextSummary ? `Previous step results:\n${contextSummary}` : ''}

Produce the output for this step. Return valid JSON.`;

    const response = await this.ai.generateText(prompt, {
      systemMessage: 'You are an autonomous agent executing a task step. Return only valid JSON with the step output.',
      responseFormat: 'json_object',
      temperature: 0.5,
      maxTokens: 2048,
      userId,
    });

    try {
      const parsed = JSON.parse(response);
      return { source: 'ai', action, result: parsed };
    } catch {
      return { source: 'ai', action, result: { text: response } };
    }
  }

  // ================================================================
  // PRIVATE — Helpers
  // ================================================================

  private async withTimeout<T>(fn: () => Promise<T>, ms: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Step timed out after ${ms}ms`)), ms);
      fn().then(
        (val) => { clearTimeout(timer); resolve(val); },
        (err) => { clearTimeout(timer); reject(err); },
      );
    });
  }

  private emitEvent(userId: string, event: string, data: any): void {
    try {
      this.gateway.emitToUser(userId, event, data);
    } catch (err) {
      this.logger.warn(`Failed to emit ${event} to user ${userId}: ${err.message}`);
    }
  }

  private async getTaskEntity(taskId: string): Promise<AutonomousTaskEntity | null> {
    return this.db.findOne<AutonomousTaskEntity>('autonomous_tasks', { id: taskId });
  }

  private transformTask(entity: AutonomousTaskEntity): AutonomousTask {
    if (!entity) return null as any;
    return {
      id: entity.id,
      userId: entity.user_id,
      conversationId: entity.conversation_id,
      parentTaskId: entity.parent_task_id,
      taskType: entity.task_type as any,
      title: entity.title,
      description: entity.description,
      input: entity.input,
      config: entity.config as any,
      plan: entity.plan as any,
      status: entity.status as TaskStatus,
      progress: entity.progress as TaskProgress,
      priority: entity.priority,
      scheduledAt: entity.scheduled_at,
      repeatConfig: entity.repeat_config as any,
      result: entity.result,
      error: entity.error as any,
      retryCount: entity.retry_count,
      maxRetries: entity.max_retries,
      timeoutSeconds: entity.timeout_seconds,
      maxSteps: entity.max_steps,
      tokensUsed: entity.tokens_used,
      costCents: entity.cost_cents,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
      startedAt: entity.started_at,
      completedAt: entity.completed_at,
      lastHeartbeatAt: entity.last_heartbeat_at,
    };
  }
}
