import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SESClient,
  SendEmailCommand,
  SESClientConfig,
} from '@aws-sdk/client-ses';

export interface SESEmailOptions {
  from?: string;
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  tags?: Array<{
    Name: string;
    Value: string;
  }>;
  configurationSetName?: string;
}

export interface SESEmailResponse {
  messageId: string;
  status: 'sent' | 'failed';
  error?: string;
  details?: any;
}

@Injectable()
export class SESService {
  private readonly logger = new Logger(SESService.name);
  private readonly sesClient: SESClient | null = null;
  private readonly defaultFrom: string;
  private readonly configurationSet?: string;
  private readonly isConfigured: boolean = false;

  constructor(private configService: ConfigService) {
    // Initialize AWS SES Client
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );

    if (!accessKeyId || !secretAccessKey) {
      this.logger.warn(
        'AWS credentials not configured. Email sending will be disabled. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.',
      );
      this.isConfigured = false;
    } else {
      const sesConfig: SESClientConfig = {
        region: this.configService.get('AWS_REGION', 'us-east-1'),
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      };

      this.sesClient = new SESClient(sesConfig);
      this.isConfigured = true;
      this.logger.log('SES Service initialized with region:', sesConfig.region);
    }

    this.defaultFrom = this.configService.get(
      'EMAIL_DEFAULT_FROM',
      'noreply@widest.life',
    );
    this.configurationSet = this.configService.get('SES_CONFIGURATION_SET');
  }

  /**
   * Check if SES is configured and ready to send emails
   */
  isReady(): boolean {
    return this.isConfigured && this.sesClient !== null;
  }

  /**
   * Send email directly via AWS SES
   */
  async sendEmail(options: SESEmailOptions): Promise<SESEmailResponse> {
    if (!this.isReady()) {
      this.logger.warn(
        'SES not configured. Skipping email send to:',
        options.to,
      );
      return {
        messageId: `mock-${Date.now()}`,
        status: 'failed',
        error: 'SES not configured',
      };
    }

    try {
      const from = options.from || this.defaultFrom;
      const toAddresses = this.normalizeAddresses(options.to);
      const ccAddresses = options.cc
        ? this.normalizeAddresses(options.cc)
        : undefined;
      const bccAddresses = options.bcc
        ? this.normalizeAddresses(options.bcc)
        : undefined;
      const replyToAddresses = options.replyTo
        ? this.normalizeAddresses(options.replyTo)
        : undefined;

      // Build SES send email command
      const command = new SendEmailCommand({
        Source: from,
        Destination: {
          ToAddresses: toAddresses,
          CcAddresses: ccAddresses,
          BccAddresses: bccAddresses,
        },
        ReplyToAddresses: replyToAddresses,
        Message: {
          Subject: {
            Data: options.subject,
            Charset: 'UTF-8',
          },
          Body: {
            Text: options.text
              ? {
                  Data: options.text,
                  Charset: 'UTF-8',
                }
              : undefined,
            Html: options.html
              ? {
                  Data: options.html,
                  Charset: 'UTF-8',
                }
              : undefined,
          },
        },
        Tags: options.tags,
        ConfigurationSetName:
          options.configurationSetName || this.configurationSet,
      });

      // Send email via SES
      const response = await this.sesClient!.send(command);

      this.logger.log(
        `Email sent successfully via SES: ${options.subject} to ${toAddresses.join(', ')}`,
      );
      this.logger.log(`SES Message ID: ${response.MessageId}`);

      return {
        messageId: response.MessageId!,
        status: 'sent',
        details: {
          from,
          to: toAddresses,
          subject: options.subject,
          timestamp: new Date().toISOString(),
          sesResponse: response,
        },
      };
    } catch (error) {
      this.logger.error('Failed to send email via SES:', error);

      return {
        messageId: `error-${Date.now()}`,
        status: 'failed',
        error: error.message,
      };
    }
  }

  /**
   * Normalize email addresses to string array
   */
  private normalizeAddresses(addresses: string | string[]): string[] {
    return Array.isArray(addresses) ? addresses : [addresses];
  }

  /**
   * Test SES connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.isReady()) {
      return false;
    }

    try {
      // Simple test by getting account sending enabled status
      const { GetAccountSendingEnabledCommand } = await import(
        '@aws-sdk/client-ses'
      );
      const command = new GetAccountSendingEnabledCommand({});
      await this.sesClient!.send(command);
      return true;
    } catch (error) {
      this.logger.error('SES connection test failed:', error);
      return false;
    }
  }

  /**
   * Get SES configuration
   */
  getConfiguration(): {
    region: string;
    defaultFrom: string;
    hasCredentials: boolean;
    configurationSet?: string;
  } {
    return {
      region: this.configService.get('AWS_REGION', 'us-east-1'),
      defaultFrom: this.defaultFrom,
      hasCredentials: this.isConfigured,
      configurationSet: this.configurationSet,
    };
  }
}
