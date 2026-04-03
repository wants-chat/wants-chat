import { IsOptional, IsString, IsNumber, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserQueryDto {
  @ApiProperty({ example: 'john', required: false, description: 'Search term for username, full name, or bio' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ example: 1, required: false, description: 'Page number', minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 20, required: false, description: 'Items per page', minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ example: 0, required: false, description: 'Offset for pagination' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;

  @ApiProperty({ 
    example: 'created_at', 
    required: false, 
    description: 'Sort by field',
    enum: ['created_at', 'updated_at', 'username', 'full_name']
  })
  @IsOptional()
  @IsString()
  @IsIn(['created_at', 'updated_at', 'username', 'full_name'])
  sort_by?: string = 'created_at';

  @ApiProperty({ 
    example: 'desc', 
    required: false, 
    description: 'Sort order',
    enum: ['asc', 'desc']
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sort_order?: string = 'desc';

  @ApiProperty({ example: '2024-01-01', required: false, description: 'Start date for filtering' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ example: '2024-12-31', required: false, description: 'End date for filtering' })
  @IsOptional()
  @IsString()
  endDate?: string;
}

export class ActivityQueryDto {
  @ApiProperty({ example: 1, required: false, description: 'Page number', minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 50, required: false, description: 'Items per page', minimum: 1, maximum: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(200)
  limit?: number = 50;

  @ApiProperty({ 
    example: 'profile_updated', 
    required: false, 
    description: 'Filter by activity type'
  })
  @IsOptional()
  @IsString()
  activity_type?: string;
}

export class DeleteAccountDto {
  @ApiProperty({ example: 'password123', description: 'User password for confirmation' })
  @IsString()
  password: string;
}