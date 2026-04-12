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
  user_id: string;
  name: string;
  description: string;
  process: CrewProcess;
  agents: AgentDefinition[];
  created_at: Date;
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
  crew_id: string;
  user_id: string;
  input: string;
  status: CrewExecutionStatus;
  agent_outputs: AgentOutput[];
  final_output: string | null;
  started_at: Date;
  completed_at: Date | null;
}

export interface CrewTemplate {
  name: string;
  description: string;
  process: CrewProcess;
  agents: AgentDefinition[];
}
