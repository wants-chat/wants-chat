export type CrewProcess = 'sequential' | 'parallel';

export type CrewExecutionStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface AgentDefinition {
  name: string;
  role: string;
  systemPrompt: string;
  tools: string[];
}

export interface AgentCrew {
  id: string;
  userId: string;
  name: string;
  description: string;
  process: CrewProcess;
  agents: AgentDefinition[];
  createdAt: Date;
}

export interface AgentOutput {
  agentName: string;
  agentRole: string;
  input: string;
  output: string;
  startedAt: string;
  completedAt: string;
}

export interface CrewExecution {
  id: string;
  crewId: string;
  userId: string;
  input: string;
  status: CrewExecutionStatus;
  agentOutputs: AgentOutput[];
  finalOutput: string | null;
  startedAt: Date;
  completedAt: Date | null;
}

export interface CrewTemplate {
  name: string;
  description: string;
  process: CrewProcess;
  agents: AgentDefinition[];
}
