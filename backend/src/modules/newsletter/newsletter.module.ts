import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { DatabaseModule } from '../database/database.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [ConfigModule, DatabaseModule, EmailModule],
  controllers: [NewsletterController],
  providers: [NewsletterService],
  exports: [NewsletterService],
})
export class NewsletterModule {}
