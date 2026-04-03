import { IsArray, IsBoolean, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class NotificationPreferencesDto {
  @ApiProperty({ example: true, required: false })
  @IsOptional()
  email?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  push?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  in_app?: boolean;
}

export class PrivacyPreferencesDto {
  @ApiProperty({ example: 'public', enum: ['public', 'private', 'friends'], required: false })
  @IsOptional()
  @IsString()
  profile_visibility?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  show_activity?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  show_stats?: boolean;
}

export class FeaturePreferencesDto {
  @ApiProperty({ example: true, required: false })
  @IsOptional()
  health_tracking?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  fitness_tracking?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  finance_tracking?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  meditation_tracking?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  travel_planning?: boolean;
}

export class UserPreferencesDto {
  @ApiProperty({ example: 'light', enum: ['light', 'dark'], required: false })
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiProperty({ example: 'America/New_York', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ example: 'en', required: false })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ description: 'Notification preferences', required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => NotificationPreferencesDto)
  notifications?: NotificationPreferencesDto;

  @ApiProperty({ description: 'Privacy preferences', required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PrivacyPreferencesDto)
  privacy?: PrivacyPreferencesDto;

  @ApiProperty({ description: 'Feature preferences', required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => FeaturePreferencesDto)
  features?: FeaturePreferencesDto;
}

// App Preferences DTOs for onboarding app selection
export class AppPreferencesDto {
  @ApiProperty({
    example: ['meditation', 'fitness', 'expense-tracker', 'todo'],
    description: 'Array of selected app IDs',
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedApps?: string[];

  @ApiProperty({
    example: true,
    description: 'Whether app onboarding has been completed',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  appOnboardingCompleted?: boolean;
}

export class AppPreferencesResponseDto {
  @ApiProperty({
    example: ['meditation', 'fitness', 'expense-tracker', 'todo'],
    description: 'Array of selected app IDs'
  })
  selectedApps: string[];

  @ApiProperty({
    example: true,
    description: 'Whether app onboarding has been completed'
  })
  appOnboardingCompleted: boolean;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Last update timestamp'
  })
  updatedAt: string;
}