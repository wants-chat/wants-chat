import { IsString, IsNotEmpty, IsArray, IsOptional, IsIn } from 'class-validator';
import { AgentDefinition, CrewProcess } from '../interfaces/agent-crew.interfaces';

export class CreateCrewDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsIn(['sequential', 'parallel'])
  process: CrewProcess;

  @IsArray()
  @IsNotEmpty()
  agents: AgentDefinition[];
}

export class ExecuteCrewDto {
  @IsString()
  @IsNotEmpty()
  input: string;
}
