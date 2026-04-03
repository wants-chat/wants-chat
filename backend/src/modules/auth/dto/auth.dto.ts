import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'johndoe', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'http://localhost:5174', required: false, description: 'Frontend URL for email verification redirect' })
  @IsOptional()
  @IsString()
  frontendUrl?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class UpdateProfileDto {
  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'user@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'https://example.com', required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ example: 'Software developer passionate about building great products', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '+1', required: false })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiProperty({ example: 'New York, USA', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: 'https://cdn.example.com/avatars/user123.jpg', required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ example: 'America/New_York', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ example: 'en', required: false })
  @IsOptional()
  @IsString()
  language?: string;
}

// Keep for backward compatibility
export class AuthUpdateProfileDto extends UpdateProfileDto {}

export class PasswordResetRequestDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}

export class PasswordResetConfirmDto {
  @ApiProperty({ example: 'reset_token_here' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'newpassword123' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'currentpassword123' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'newpassword123' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class VerifyEmailDto {
  @ApiProperty({ example: 'verification_token_here' })
  @IsString()
  token: string;
}

export class ResendEmailVerificationDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}
