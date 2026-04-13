import { AgentDefinition, CrewProcess } from '../interfaces/agent-crew.interfaces';

export class CreateCrewDto {
  name: string;
  description: string;
  process: CrewProcess;
  agents: AgentDefinition[];
}

export class ExecuteCrewDto {
  input: string;
}
