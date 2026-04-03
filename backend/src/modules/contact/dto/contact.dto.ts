import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ContactSubjectType {
  GENERAL = 'general',
  SUPPORT = 'support',
  SALES = 'sales',
  PARTNERSHIP = 'partnership',
  FEEDBACK = 'feedback',
  BUG_REPORT = 'bug_report',
  OTHER = 'other',
}

export class ContactFormDto {
  @ApiProperty({ description: 'Full name', example: 'John Doe' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @ApiProperty({ description: 'Email address', example: 'john@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ description: 'Message subject', example: 'Question about pricing' })
  @IsNotEmpty({ message: 'Subject is required' })
  @IsString()
  @MinLength(3, { message: 'Subject must be at least 3 characters' })
  @MaxLength(200, { message: 'Subject must not exceed 200 characters' })
  subject: string;

  @ApiProperty({ description: 'Message content', example: 'I would like to know more about...' })
  @IsNotEmpty({ message: 'Message is required' })
  @IsString()
  @MinLength(10, { message: 'Message must be at least 10 characters' })
  @MaxLength(5000, { message: 'Message must not exceed 5000 characters' })
  message: string;

  @ApiPropertyOptional({ description: 'Subject type', enum: ContactSubjectType })
  @IsOptional()
  @IsEnum(ContactSubjectType)
  subjectType?: ContactSubjectType;

  @ApiPropertyOptional({ description: 'Company name', example: 'Acme Inc.' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  company?: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '+1-555-123-4567' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;
}

export class ContactResponse {
  success: boolean;
  message: string;
  ticketId?: string;
}
