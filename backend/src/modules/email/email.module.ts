import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { SESService } from './ses.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [ConfigModule, DatabaseModule],
  providers: [EmailService, SESService],
  exports: [EmailService, SESService],
})
export class EmailModule {}
