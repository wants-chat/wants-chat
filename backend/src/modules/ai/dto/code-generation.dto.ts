import { IsString, IsOptional, IsEnum, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ProgrammingLanguage {
  JAVASCRIPT = 'javascript',
  TYPESCRIPT = 'typescript',
  PYTHON = 'python',
  JAVA = 'java',
  CSHARP = 'csharp',
  CPP = 'cpp',
  C = 'c',
  GO = 'go',
  RUST = 'rust',
  PHP = 'php',
  RUBY = 'ruby',
  SWIFT = 'swift',
  KOTLIN = 'kotlin',
  DART = 'dart',
  HTML = 'html',
  CSS = 'css',
  SQL = 'sql',
  SHELL = 'shell',
  POWERSHELL = 'powershell',
  R = 'r',
  MATLAB = 'matlab',
  SCALA = 'scala',
  PERL = 'perl',
  LUA = 'lua',
  OTHER = 'other'
}

export enum CodeType {
  FUNCTION = 'function',
  CLASS = 'class',
  COMPONENT = 'component',
  API_ENDPOINT = 'api_endpoint',
  DATABASE_QUERY = 'database_query',
  ALGORITHM = 'algorithm',
  SCRIPT = 'script',
  CONFIGURATION = 'configuration',
  TEST = 'test',
  DOCUMENTATION = 'documentation',
  TEMPLATE = 'template',
  UTILITY = 'utility',
  MODULE = 'module',
  FULL_APPLICATION = 'full_application'
}

export enum Framework {
  REACT = 'react',
  ANGULAR = 'angular',
  VUE = 'vue',
  SVELTE = 'svelte',
  NEXT_JS = 'nextjs',
  NUXT_JS = 'nuxtjs',
  EXPRESS = 'express',
  NESTJS = 'nestjs',
  FASTAPI = 'fastapi',
  DJANGO = 'django',
  FLASK = 'flask',
  SPRING_BOOT = 'spring_boot',
  LARAVEL = 'laravel',
  RAILS = 'rails',
  DOTNET = 'dotnet',
  FLUTTER = 'flutter',
  REACT_NATIVE = 'react_native',
  IONIC = 'ionic',
  NONE = 'none',
  OTHER = 'other'
}

export enum CodeComplexity {
  SIMPLE = 'simple',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export class GenerateCodeDto {
  @ApiProperty({ description: 'Description of the code to generate', example: 'Create a REST API endpoint for user authentication with JWT tokens' })
  @IsString()
  prompt: string;

  @ApiProperty({ 
    description: 'Programming language',
    enum: ProgrammingLanguage,
    example: ProgrammingLanguage.TYPESCRIPT
  })
  @IsEnum(ProgrammingLanguage)
  language: ProgrammingLanguage;

  @ApiProperty({ 
    description: 'Type of code to generate',
    enum: CodeType,
    example: CodeType.API_ENDPOINT
  })
  @IsEnum(CodeType)
  code_type: CodeType;

  @ApiPropertyOptional({ 
    description: 'Framework or library to use',
    enum: Framework,
    example: Framework.NESTJS
  })
  @IsOptional()
  @IsEnum(Framework)
  framework?: Framework;

  @ApiPropertyOptional({ 
    description: 'Complexity level of the code',
    enum: CodeComplexity,
    example: CodeComplexity.INTERMEDIATE,
    default: CodeComplexity.INTERMEDIATE
  })
  @IsOptional()
  @IsEnum(CodeComplexity)
  complexity?: CodeComplexity;

  @ApiPropertyOptional({ description: 'Specific requirements or features', example: ['validation', 'error handling', 'unit tests'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @ApiPropertyOptional({ description: 'Dependencies or packages to include', example: ['express', 'jsonwebtoken', 'bcrypt'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dependencies?: string[];

  @ApiPropertyOptional({ description: 'Coding style or conventions', example: 'Google JavaScript Style Guide' })
  @IsOptional()
  @IsString()
  style_guide?: string;

  @ApiPropertyOptional({ description: 'Include comments and documentation', default: true })
  @IsOptional()
  @IsBoolean()
  include_comments?: boolean;

  @ApiPropertyOptional({ description: 'Include error handling', default: true })
  @IsOptional()
  @IsBoolean()
  include_error_handling?: boolean;

  @ApiPropertyOptional({ description: 'Include input validation', default: true })
  @IsOptional()
  @IsBoolean()
  include_validation?: boolean;

  @ApiPropertyOptional({ description: 'Include unit tests', default: false })
  @IsOptional()
  @IsBoolean()
  include_tests?: boolean;

  @ApiPropertyOptional({ description: 'Target environment', example: 'production' })
  @IsOptional()
  @IsString()
  environment?: 'development' | 'staging' | 'production';

  @ApiPropertyOptional({ description: 'Performance considerations', example: ['optimization', 'caching', 'scalability'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  performance_requirements?: string[];

  @ApiPropertyOptional({ description: 'Security considerations', example: ['authentication', 'authorization', 'input_sanitization'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  security_requirements?: string[];

  @ApiPropertyOptional({ description: 'Database type if applicable', example: 'postgresql' })
  @IsOptional()
  @IsString()
  database?: string;

  @ApiPropertyOptional({ description: 'Additional context or constraints' })
  @IsOptional()
  @IsString()
  additional_context?: string;
}