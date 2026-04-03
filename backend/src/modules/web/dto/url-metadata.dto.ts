import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UrlMetadataDto {
  @ApiProperty()
  url: string;

  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  image?: string;

  @ApiPropertyOptional()
  favicon?: string;

  @ApiPropertyOptional()
  siteName?: string;

  @ApiPropertyOptional()
  type?: string;

  @ApiPropertyOptional()
  author?: string;

  @ApiPropertyOptional()
  publishedTime?: string;
}

export class UrlContentDto {
  @ApiProperty()
  url: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  wordCount: number;

  @ApiProperty()
  readingTime: number;
}

export class UrlSummaryDto {
  @ApiProperty()
  url: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  summary: string;

  @ApiProperty({ type: [String] })
  keyPoints: string[];

  @ApiPropertyOptional({ type: [String] })
  quotes?: string[];
}
