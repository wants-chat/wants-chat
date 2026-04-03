import { IsUrl, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FetchUrlDto {
  @ApiProperty({ description: 'URL to fetch content from' })
  @IsUrl({}, { message: 'Must be a valid URL' })
  url: string;

  @ApiPropertyOptional({ description: 'Whether to extract only the main content' })
  @IsOptional()
  @IsBoolean()
  extractMain?: boolean;
}

export class SummarizeUrlDto {
  @ApiProperty({ description: 'URL to summarize' })
  @IsUrl({}, { message: 'Must be a valid URL' })
  url: string;
}
