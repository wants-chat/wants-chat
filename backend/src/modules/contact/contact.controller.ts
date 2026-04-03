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
import { ContactService } from './contact.service';
import { ContactFormDto, ContactResponse } from './dto/contact.dto';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  private readonly logger = new Logger(ContactController.name);

  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit contact form' })
  @ApiResponse({ status: 200, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async submitContactForm(@Body() dto: ContactFormDto): Promise<ContactResponse> {
    try {
      this.logger.log(`Contact form submission from: ${dto.email}`);
      return await this.contactService.submitContactForm(dto);
    } catch (error) {
      this.logger.error(`Contact form error: ${error.message}`);
      throw new BadRequestException(error.message || 'Failed to send message');
    }
  }
}
