import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { WebService } from './web.service';
import { FetchUrlDto, SummarizeUrlDto } from './dto/fetch-url.dto';
import { ScreenshotDto } from './dto/screenshot.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Web')
@Controller('web')
export class WebController {
  constructor(private readonly webService: WebService) {}

  @Get('metadata')
  @ApiOperation({ summary: 'Get URL metadata (title, description, image, etc.)' })
  @ApiQuery({ name: 'url', required: true, description: 'URL to fetch metadata for' })
  async getMetadata(@Query('url') url: string) {
    if (!url) {
      throw new BadRequestException('URL is required');
    }

    if (!this.webService.isValidUrl(url)) {
      throw new BadRequestException('Invalid or blocked URL');
    }

    const normalizedUrl = this.webService.normalizeUrl(url);
    return this.webService.getMetadata(normalizedUrl);
  }

  @Post('fetch')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch and extract content from URL' })
  async fetchContent(@Body() dto: FetchUrlDto) {
    if (!this.webService.isValidUrl(dto.url)) {
      throw new BadRequestException('Invalid or blocked URL');
    }

    const normalizedUrl = this.webService.normalizeUrl(dto.url);
    const content = await this.webService.fetchContent(normalizedUrl);

    return {
      url: normalizedUrl,
      sourceUrl: normalizedUrl, // For "Open Website" button
      title: content.title,
      content: content.textContent,
      wordCount: content.wordCount,
      readingTime: content.readingTime,
    };
  }

  @Post('summarize')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch URL and generate LLM summary' })
  async summarizeUrl(@Body() dto: SummarizeUrlDto, @Req() req: Request) {
    if (!this.webService.isValidUrl(dto.url)) {
      throw new BadRequestException('Invalid or blocked URL');
    }

    const normalizedUrl = this.webService.normalizeUrl(dto.url);
    const user = req['user'] as any;
    const userId = user?.userId || user?.id || user?.sub;

    const result = await this.webService.summarizeUrl(normalizedUrl, userId);

    return {
      ...result,
      sourceUrl: normalizedUrl, // For "Open Website" button
    };
  }

  @Post('screenshot')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Capture screenshot of URL' })
  async captureScreenshot(@Body() dto: ScreenshotDto, @Req() req: Request) {
    if (!this.webService.isValidUrl(dto.url)) {
      throw new BadRequestException('Invalid or blocked URL');
    }

    const normalizedUrl = this.webService.normalizeUrl(dto.url);
    const user = req['user'] as any;
    const userId = user?.userId || user?.id || user?.sub;

    const result = await this.webService.captureScreenshot(
      normalizedUrl,
      {
        fullPage: dto.fullPage,
        width: dto.width,
        height: dto.height,
        selector: dto.selector,
      },
      userId
    );

    return {
      ...result,
      // Ensure sourceUrl is clearly available for "Open Website" button
      sourceUrl: normalizedUrl,
    };
  }
}
