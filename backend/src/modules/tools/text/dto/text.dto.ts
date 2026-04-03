import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsBoolean, IsInt, Min, Max } from 'class-validator';

export enum TextCase {
  CAMEL = 'camel',
  SNAKE = 'snake',
  PASCAL = 'pascal',
  KEBAB = 'kebab',
  UPPER = 'upper',
  LOWER = 'lower',
  TITLE = 'title',
  SENTENCE = 'sentence',
  CONSTANT = 'constant',
}

export class JsonFormatDto {
  @ApiProperty({ description: 'JSON string to format' })
  @IsString()
  json: string;

  @ApiPropertyOptional({ description: 'Indentation spaces (default: 2)', example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(8)
  indent?: number;
}

export class JsonToCsvDto {
  @ApiProperty({ description: 'JSON array to convert to CSV' })
  @IsString()
  json: string;

  @ApiPropertyOptional({ description: 'Include headers row', default: true })
  @IsOptional()
  @IsBoolean()
  includeHeaders?: boolean;

  @ApiPropertyOptional({ description: 'CSV delimiter', default: ',' })
  @IsOptional()
  @IsString()
  delimiter?: string;
}

export class CsvToJsonDto {
  @ApiProperty({ description: 'CSV string to convert to JSON' })
  @IsString()
  csv: string;

  @ApiPropertyOptional({ description: 'First row contains headers', default: true })
  @IsOptional()
  @IsBoolean()
  hasHeaders?: boolean;

  @ApiPropertyOptional({ description: 'CSV delimiter', default: ',' })
  @IsOptional()
  @IsString()
  delimiter?: string;
}

export class JsonToYamlDto {
  @ApiProperty({ description: 'JSON string to convert to YAML' })
  @IsString()
  json: string;

  @ApiPropertyOptional({ description: 'Indentation spaces (default: 2)', example: 2 })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(8)
  indent?: number;
}

export class YamlToJsonDto {
  @ApiProperty({ description: 'YAML string to convert to JSON' })
  @IsString()
  yaml: string;
}

export class MarkdownPreviewDto {
  @ApiProperty({ description: 'Markdown content to preview' })
  @IsString()
  markdown: string;

  @ApiPropertyOptional({ description: 'Enable GitHub-flavored markdown', default: true })
  @IsOptional()
  @IsBoolean()
  gfm?: boolean;

  @ApiPropertyOptional({ description: 'Sanitize HTML output', default: true })
  @IsOptional()
  @IsBoolean()
  sanitize?: boolean;
}

export class TextCaseConvertDto {
  @ApiProperty({ description: 'Text to convert' })
  @IsString()
  text: string;

  @ApiProperty({
    description: 'Target case format',
    enum: TextCase,
    example: TextCase.CAMEL,
  })
  @IsEnum(TextCase)
  targetCase: TextCase;
}

export class TextCountDto {
  @ApiProperty({ description: 'Text to count' })
  @IsString()
  text: string;
}

// Response DTOs
export class JsonFormatResponseDto {
  @ApiProperty()
  formatted: string;

  @ApiProperty()
  valid: boolean;

  @ApiPropertyOptional()
  error?: string;
}

export class JsonToCsvResponseDto {
  @ApiProperty()
  csv: string;

  @ApiProperty()
  rowCount: number;
}

export class CsvToJsonResponseDto {
  @ApiProperty()
  json: any[];

  @ApiProperty()
  rowCount: number;
}

export class JsonToYamlResponseDto {
  @ApiProperty()
  yaml: string;
}

export class YamlToJsonResponseDto {
  @ApiProperty()
  json: any;
}

export class MarkdownPreviewResponseDto {
  @ApiProperty()
  html: string;
}

export class TextCaseConvertResponseDto {
  @ApiProperty()
  original: string;

  @ApiProperty()
  converted: string;

  @ApiProperty()
  targetCase: string;
}

export class TextCountResponseDto {
  @ApiProperty()
  characters: number;

  @ApiProperty()
  charactersNoSpaces: number;

  @ApiProperty()
  words: number;

  @ApiProperty()
  sentences: number;

  @ApiProperty()
  paragraphs: number;

  @ApiProperty()
  lines: number;
}
