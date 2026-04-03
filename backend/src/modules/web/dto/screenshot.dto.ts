import { IsUrl, IsOptional, IsBoolean, IsNumber, IsString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScreenshotDto {
  @ApiProperty({ description: 'URL to capture screenshot of' })
  @IsUrl({}, { message: 'Must be a valid URL' })
  url: string;

  @ApiPropertyOptional({ description: 'Capture full page instead of viewport' })
  @IsOptional()
  @IsBoolean()
  fullPage?: boolean;

  @ApiPropertyOptional({ description: 'Viewport width', default: 1280 })
  @IsOptional()
  @IsNumber()
  @Min(320)
  @Max(3840)
  width?: number;

  @ApiPropertyOptional({ description: 'Viewport height', default: 800 })
  @IsOptional()
  @IsNumber()
  @Min(240)
  @Max(2160)
  height?: number;

  @ApiPropertyOptional({ description: 'CSS selector to capture specific element' })
  @IsOptional()
  @IsString()
  selector?: string;
}

export class ScreenshotResponseDto {
  @ApiProperty()
  url: string;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty()
  width: number;

  @ApiProperty()
  height: number;

  @ApiProperty()
  fullPage: boolean;

  @ApiProperty()
  capturedAt: string;
}
