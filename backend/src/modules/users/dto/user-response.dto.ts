import { ApiProperty } from '@nestjs/swagger';

export class UserProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  full_name?: string;

  @ApiProperty()
  bio?: string;

  @ApiProperty()
  location?: string;

  @ApiProperty()
  website?: string;

  @ApiProperty()
  avatar_url?: string;

  @ApiProperty()
  preferences: Record<string, any>;

  @ApiProperty()
  timezone: string;

  @ApiProperty()
  language: string;

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;

  @ApiProperty()
  last_login_at?: string;

  @ApiProperty({ description: 'Profile completion percentage (0-100)' })
  profile_completion: number;
}

export class PublicUserProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  full_name?: string;

  @ApiProperty()
  bio?: string;

  @ApiProperty()
  location?: string;

  @ApiProperty()
  website?: string;

  @ApiProperty()
  avatar_url?: string;

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  is_own_profile: boolean;
}

export class UserPreferencesResponseDto {
  @ApiProperty()
  preferences: Record<string, any>;

  @ApiProperty()
  timezone: string;

  @ApiProperty()
  language: string;
}

export class UserActivityItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty()
  activity_type: string;

  @ApiProperty()
  data: Record<string, any>;

  @ApiProperty()
  created_at: string;
}

export class UserActivityResponseDto {
  @ApiProperty({ type: [UserActivityItemDto] })
  data: UserActivityItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total_pages: number;
}

export class PaginatedUsersDto {
  @ApiProperty({ type: [PublicUserProfileDto] })
  data: PublicUserProfileDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total_pages: number;
}

export class AvatarUploadResponseDto {
  @ApiProperty()
  avatar_url: string;

  @ApiProperty()
  message: string;
}

export class MessageResponseDto {
  @ApiProperty()
  message: string;
}

export class UserDataExportDto {
  @ApiProperty()
  exported_at: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty()
  data: {
    profile: any;
    health_profile: any;
    fitness_activities: any[];
    nutrition_logs: any[];
    health_metrics: any[];
    expenses: any[];
    budgets: any[];
    meditation_sessions: any[];
    mental_health_logs: any[];
    travel_plans: any[];
    ai_generations: any[];
    notifications: any[];
    reminders: any[];
    user_activity: any[];
  };
}