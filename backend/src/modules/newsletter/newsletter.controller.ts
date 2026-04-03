import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NewsletterService } from './newsletter.service';
import { SubscribeDto, UnsubscribeDto } from './dto/newsletter.dto';

@ApiTags('Newsletter')
@Controller('notifications/newsletter')
export class NewsletterController {
  private readonly logger = new Logger(NewsletterController.name);

  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Subscribe to newsletter' })
  @ApiResponse({ status: 200, description: 'Successfully subscribed' })
  @ApiResponse({ status: 400, description: 'Invalid email' })
  async subscribe(@Body() dto: SubscribeDto) {
    try {
      this.logger.log(`Newsletter subscription request: ${dto.email}`);
      const result = await this.newsletterService.subscribe(dto);
      return result;
    } catch (error) {
      this.logger.error(`Newsletter subscription error: ${error.message}`);
      throw new BadRequestException(error.message || 'Failed to subscribe');
    }
  }

  @Post('unsubscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unsubscribe from newsletter' })
  @ApiResponse({ status: 200, description: 'Successfully unsubscribed' })
  @ApiResponse({ status: 400, description: 'Invalid email' })
  async unsubscribe(@Body() dto: UnsubscribeDto) {
    try {
      this.logger.log(`Newsletter unsubscribe request: ${dto.email}`);
      const result = await this.newsletterService.unsubscribe(dto);
      return result;
    } catch (error) {
      this.logger.error(`Newsletter unsubscribe error: ${error.message}`);
      throw new BadRequestException(error.message || 'Failed to unsubscribe');
    }
  }
}
