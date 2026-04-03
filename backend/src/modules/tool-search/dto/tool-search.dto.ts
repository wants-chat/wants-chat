import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ToolSearchQueryDto {
  @IsString()
  q: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 8;

  @IsOptional()
  @IsString()
  category?: string;
}

export interface ToolSearchResult {
  toolId: string;
  title: string;
  description: string;
  category: string;
  categoryName: string;
  icon: string;
  type: string;
  score: number;
}

export interface ToolEmbeddingPayload {
  toolId: string;
  title: string;
  description: string;
  category: string;
  categoryName: string;
  type: string;
  icon: string;
  searchText: string;
  synonyms: string[];
  useCases: string[];
  languages: string[];
  popularity: number;
}

export interface ToolSearchResponse {
  tools: ToolSearchResult[];
  query: string;
  totalMatches: number;
}
