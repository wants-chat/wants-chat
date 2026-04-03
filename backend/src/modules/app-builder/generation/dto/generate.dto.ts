import { ApiProperty, ApiPropertyOptional, ApiHideProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, MinLength, IsBoolean } from 'class-validator';

export class GenerateDto {
  @ApiProperty({
    description: 'User prompt describing the app to build',
    example: 'Create a social network',
  })
  @IsString()
  @MinLength(10)
  prompt: string;

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  appName?: string;

  @ApiHideProperty()
  @IsOptional()
  @IsArray()
  frameworks?: string[];

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  conversationId?: string;
}

export class AnalyzeDto {
  @ApiProperty({
    description: 'User prompt to analyze',
    example: 'Create an online bookstore with user reviews',
    minLength: 10,
  })
  @IsString()
  @MinLength(10)
  prompt: string;
}

export class DetectDto {
  @ApiProperty({
    description: 'User prompt for app type detection',
    example: 'I need an e-commerce platform',
    minLength: 5,
  })
  @IsString()
  @MinLength(5)
  prompt: string;
}

export class DeployDto {
  @ApiProperty({
    description: 'App ID (UUID from generation)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsString()
  appId: string;

  @ApiProperty({
    description: 'Path to generated app directory',
    example: './generated/a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsString()
  appPath: string;
}

export class GenerateAndDeployDto {
  @ApiProperty({
    description: 'User prompt describing the app to build',
    example: 'Create an online bookstore with user reviews and wishlist',
    minLength: 10,
  })
  @IsString()
  @MinLength(10)
  prompt: string;

  @ApiPropertyOptional({
    description: 'Custom app name',
    example: 'BookstoreHub',
  })
  @IsOptional()
  @IsString()
  appName?: string;

  @ApiPropertyOptional({
    description: 'Whether to deploy after generation (default: true)',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  deploy?: boolean;
}
