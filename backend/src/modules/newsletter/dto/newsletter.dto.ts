import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubscribeDto {
  @ApiProperty({ description: 'Email address to subscribe', example: 'user@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiPropertyOptional({ description: 'Subscription source', example: 'website' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  source?: string;

  @ApiPropertyOptional({ description: 'Subscriber name', example: 'John Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}

export class UnsubscribeDto {
  @ApiProperty({ description: 'Email address to unsubscribe', example: 'user@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiPropertyOptional({ description: 'Unsubscription token' })
  @IsOptional()
  @IsString()
  token?: string;
}

export class NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  source?: string;
  status: 'subscribed' | 'unsubscribed' | 'bounced';
  subscribedAt: Date;
  unsubscribedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
