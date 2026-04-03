import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESService } from './ses.service';
import { DatabaseService } from '../database/database.service';

export interface EmailOptions {
  from?: string;
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  organizationId?: string;
  metadata?: Record<string, any>;
}

export interface EmailLog {
  id: string;
  organizationId?: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  from: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  messageId?: string;
  error?: string;
  sentAt?: Date;
  createdAt: Date;
  metadata?: any;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly sesService: SESService,
    private readonly db: DatabaseService,
  ) {}

  /**
   * Send an email
   */
  async sendEmail(
    options: EmailOptions,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { organizationId, ...emailOptions } = options;

      // Normalize recipients
      const to = Array.isArray(emailOptions.to)
        ? emailOptions.to
        : [emailOptions.to];
      const cc = emailOptions.cc
        ? Array.isArray(emailOptions.cc)
          ? emailOptions.cc
          : [emailOptions.cc]
        : undefined;
      const bcc = emailOptions.bcc
        ? Array.isArray(emailOptions.bcc)
          ? emailOptions.bcc
          : [emailOptions.bcc]
        : undefined;

      // Send email via SES
      const result = await this.sesService.sendEmail({
        from: emailOptions.from,
        to,
        cc,
        bcc,
        subject: emailOptions.subject,
        text: emailOptions.text,
        html: emailOptions.html,
      });

      // Log email
      await this.logEmail({
        organizationId,
        to,
        cc,
        bcc,
        from:
          emailOptions.from ||
          this.configService.get('EMAIL_DEFAULT_FROM', 'noreply@widest.life'),
        subject: emailOptions.subject,
        status: result.status,
        messageId: result.messageId,
        error: result.error,
        sentAt: result.status === 'sent' ? new Date() : undefined,
        metadata: options.metadata,
      });

      return {
        success: result.status === 'sent',
        messageId: result.messageId,
        error: result.error,
      };
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);

      // Log failed attempt
      await this.logEmail({
        organizationId: options.organizationId,
        to: Array.isArray(options.to) ? options.to : [options.to],
        from:
          options.from ||
          this.configService.get('EMAIL_DEFAULT_FROM', 'noreply@widest.life'),
        subject: options.subject,
        status: 'failed',
        error: error.message,
        metadata: options.metadata,
      });

      throw error;
    }
  }

  /**
   * Send a simple email without templates
   */
  async sendSimpleEmail(
    to: string | string[],
    subject: string,
    content: { text?: string; html?: string },
    options?: {
      from?: string;
      cc?: string | string[];
      bcc?: string | string[];
      organizationId?: string;
    },
  ) {
    return this.sendEmail({
      to,
      subject,
      text: content.text,
      html: content.html,
      from: options?.from,
      cc: options?.cc,
      bcc: options?.bcc,
      organizationId: options?.organizationId,
    });
  }

  /**
   * Log email to database
   */
  private async logEmail(
    data: Omit<EmailLog, 'id' | 'createdAt'>,
  ): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO email_logs (
          organization_id, "to", cc, bcc, "from", subject,
          status, message_id, error, sent_at, metadata, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())`,
        [
          data.organizationId || null,
          data.to,
          data.cc || null,
          data.bcc || null,
          data.from,
          data.subject,
          data.status,
          data.messageId || null,
          data.error || null,
          data.sentAt || null,
          data.metadata ? JSON.stringify(data.metadata) : null,
        ],
      );
    } catch (error) {
      // Don't throw on logging errors, just log them
      this.logger.error(`Failed to log email: ${error.message}`);
    }
  }

  /**
   * Check if email service is ready
   */
  isReady(): boolean {
    return this.sesService.isReady();
  }

  /**
   * Get email service configuration
   */
  getConfiguration() {
    return this.sesService.getConfiguration();
  }
}
