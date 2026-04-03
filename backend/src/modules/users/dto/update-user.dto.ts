import { IsEmail, IsString, IsOptional, MinLength, MaxLength, IsUrl, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'john.doe@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'johndoe', required: false })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ example: 'Software developer passionate about technology', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiProperty({ example: 'San Francisco, CA', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @ApiProperty({ example: 'https://johndoe.com', required: false })
  @IsOptional()
  @ValidateIf((o) => o.website && o.website.length > 0)
  @IsUrl({}, { message: 'website must be a valid URL' })
  website?: string;

  @ApiProperty({ example: 'America/New_York', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ example: 'en', required: false })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ example: 'currentPassword123', required: false, description: 'Current password (required if changing password)' })
  @IsOptional()
  @IsString()
  current_password?: string;

  @ApiProperty({ example: 'newPassword123', required: false, description: 'New password (requires current_password)' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  new_password?: string;


  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '1990-01-01', required: false })
  @IsOptional()
  @IsString()
  dateOfBirth?: string;
  
  @ApiProperty({ example: 'male', required: false })
  @IsOptional()
  @IsString()
  gender?: string;
}