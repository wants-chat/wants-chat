import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';

export enum HashAlgorithm {
  MD5 = 'md5',
  SHA1 = 'sha1',
  SHA256 = 'sha256',
  SHA384 = 'sha384',
  SHA512 = 'sha512',
}

export enum UuidVersion {
  V4 = 'v4',
  V7 = 'v7',
}

export class Base64EncodeDto {
  @ApiProperty({ description: 'Text to encode to Base64' })
  @IsString()
  text: string;

  @ApiPropertyOptional({ description: 'Use URL-safe Base64', default: false })
  @IsOptional()
  urlSafe?: boolean;
}

export class Base64DecodeDto {
  @ApiProperty({ description: 'Base64 string to decode' })
  @IsString()
  base64: string;
}

export class UrlEncodeDto {
  @ApiProperty({ description: 'Text to URL encode' })
  @IsString()
  text: string;

  @ApiPropertyOptional({ description: 'Encode entire URL or just component', default: false })
  @IsOptional()
  encodeFullUrl?: boolean;
}

export class UrlDecodeDto {
  @ApiProperty({ description: 'URL-encoded string to decode' })
  @IsString()
  encoded: string;
}

export class HashGenerateDto {
  @ApiProperty({ description: 'Text to hash' })
  @IsString()
  text: string;

  @ApiProperty({
    description: 'Hash algorithm',
    enum: HashAlgorithm,
    example: HashAlgorithm.SHA256,
  })
  @IsEnum(HashAlgorithm)
  algorithm: HashAlgorithm;
}

export class UuidGenerateDto {
  @ApiPropertyOptional({
    description: 'UUID version (v4 or v7)',
    enum: ['v4', 'v7'],
    default: 'v4',
  })
  @IsOptional()
  @IsEnum(UuidVersion)
  version?: UuidVersion;

  @ApiPropertyOptional({ description: 'Number of UUIDs to generate', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  count?: number;
}

export class JwtDecodeDto {
  @ApiProperty({ description: 'JWT token to decode' })
  @IsString()
  token: string;
}

// Response DTOs
export class Base64EncodeResponseDto {
  @ApiProperty()
  encoded: string;

  @ApiProperty()
  originalLength: number;

  @ApiProperty()
  encodedLength: number;
}

export class Base64DecodeResponseDto {
  @ApiProperty()
  decoded: string;

  @ApiProperty()
  valid: boolean;

  @ApiPropertyOptional()
  error?: string;
}

export class UrlEncodeResponseDto {
  @ApiProperty()
  encoded: string;
}

export class UrlDecodeResponseDto {
  @ApiProperty()
  decoded: string;
}

export class HashGenerateResponseDto {
  @ApiProperty()
  hash: string;

  @ApiProperty()
  algorithm: string;

  @ApiProperty()
  inputLength: number;
}

export class UuidGenerateResponseDto {
  @ApiProperty({ type: [String] })
  uuids: string[];

  @ApiProperty()
  version: string;

  @ApiProperty()
  count: number;
}

export class JwtDecodeResponseDto {
  @ApiProperty()
  header: any;

  @ApiProperty()
  payload: any;

  @ApiProperty()
  signature: string;

  @ApiProperty()
  valid: boolean;

  @ApiPropertyOptional()
  expired?: boolean;

  @ApiPropertyOptional()
  expiresAt?: string;
}
