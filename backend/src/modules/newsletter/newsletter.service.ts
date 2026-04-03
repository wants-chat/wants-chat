import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { EmailService } from '../email/email.service';
import { SubscribeDto, UnsubscribeDto, NewsletterSubscriber } from './dto/newsletter.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);
  private readonly fromEmail: string;
  private readonly frontendUrl: string;

  constructor(
    private readonly db: DatabaseService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {
    this.fromEmail = this.configService.get('EMAIL_DEFAULT_FROM', 'noreply@wants.chat');
    this.frontendUrl = this.configService.get('FRONTEND_URL', 'https://wants.chat');
  }

  /**
   * Subscribe to newsletter
   */
  async subscribe(dto: SubscribeDto): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    try {
      // Check if already subscribed
      const existingResult = await this.db.query<NewsletterSubscriber>(
        `SELECT * FROM newsletter_subscribers WHERE email = $1`,
        [normalizedEmail]
      );
      const existing = existingResult.rows[0];

      if (existing) {
        if (existing.status === 'subscribed') {
          return {
            success: true,
            message: 'You are already subscribed to our newsletter!',
          };
        }

        // Re-subscribe if previously unsubscribed
        await this.db.query(
          `UPDATE newsletter_subscribers
           SET status = 'subscribed',
               unsubscribed_at = NULL,
               updated_at = NOW(),
               source = COALESCE($2, source),
               name = COALESCE($3, name)
           WHERE email = $1`,
          [normalizedEmail, dto.source, dto.name]
        );

        this.logger.log(`Re-subscribed: ${normalizedEmail}`);
      } else {
        // Create new subscriber
        const id = uuidv4();
        await this.db.query(
          `INSERT INTO newsletter_subscribers (id, email, name, source, status, subscribed_at, created_at, updated_at)
           VALUES ($1, $2, $3, $4, 'subscribed', NOW(), NOW(), NOW())`,
          [id, normalizedEmail, dto.name || null, dto.source || 'website']
        );

        this.logger.log(`New subscriber: ${normalizedEmail}`);
      }

      // Send welcome email (don't throw on failure)
      await this.sendWelcomeEmail(normalizedEmail, dto.name);

      return {
        success: true,
        message: 'Successfully subscribed! Check your inbox for a confirmation.',
      };
    } catch (error) {
      this.logger.error(`Subscribe error: ${error.message}`, error.stack);

      // Check for duplicate key error
      if (error.code === '23505') {
        return {
          success: true,
          message: 'You are already subscribed to our newsletter!',
        };
      }

      throw error;
    }
  }

  /**
   * Unsubscribe from newsletter
   */
  async unsubscribe(dto: UnsubscribeDto): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    try {
      const result = await this.db.query(
        `UPDATE newsletter_subscribers
         SET status = 'unsubscribed',
             unsubscribed_at = NOW(),
             updated_at = NOW()
         WHERE email = $1 AND status = 'subscribed'`,
        [normalizedEmail]
      );

      if (result.rowCount === 0) {
        return {
          success: true,
          message: 'Email not found or already unsubscribed.',
        };
      }

      this.logger.log(`Unsubscribed: ${normalizedEmail}`);

      return {
        success: true,
        message: 'Successfully unsubscribed from our newsletter.',
      };
    } catch (error) {
      this.logger.error(`Unsubscribe error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send welcome email to new subscriber
   */
  private async sendWelcomeEmail(email: string, name?: string): Promise<void> {
    try {
      const displayName = name || 'there';
      const unsubscribeUrl = `${this.frontendUrl}/unsubscribe?email=${encodeURIComponent(email)}`;

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); padding: 40px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Welcome to Wants!</h1>
              <p style="margin: 16px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">You're now part of our community</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color: #1e293b; padding: 40px; border-radius: 0 0 16px 16px;">
              <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi ${displayName},
              </p>
              <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for subscribing to the Wants newsletter! We're excited to have you on board.
              </p>
              <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                You'll receive updates about:
              </p>
              <ul style="color: #94a3b8; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0; padding-left: 20px;">
                <li>New features and tools</li>
                <li>AI insights and tips</li>
                <li>Product updates</li>
                <li>Exclusive content</li>
              </ul>
              <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                We promise not to spam you - we'll only send the good stuff!
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); border-radius: 12px;">
                    <a href="${this.frontendUrl}" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                      Explore Wants
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
                © ${new Date().getFullYear()} Info Inlet. All rights reserved.
              </p>
              <p style="color: #64748b; font-size: 12px; margin: 0;">
                <a href="${unsubscribeUrl}" style="color: #10b981; text-decoration: none;">Unsubscribe</a>
                &nbsp;|&nbsp;
                <a href="${this.frontendUrl}/privacy" style="color: #10b981; text-decoration: none;">Privacy Policy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      const text = `
Welcome to Wants!

Hi ${displayName},

Thank you for subscribing to the Wants newsletter! We're excited to have you on board.

You'll receive updates about:
- New features and tools
- AI insights and tips
- Product updates
- Exclusive content

We promise not to spam you - we'll only send the good stuff!

Visit Wants: ${this.frontendUrl}

---
© ${new Date().getFullYear()} Info Inlet. All rights reserved.
Unsubscribe: ${unsubscribeUrl}
      `;

      await this.emailService.sendEmail({
        to: email,
        from: this.fromEmail,
        subject: 'Welcome to the Wants Newsletter!',
        html,
        text,
        metadata: { type: 'newsletter_welcome' },
      });

      this.logger.log(`Welcome email sent to: ${email}`);
    } catch (error) {
      // Don't throw - welcome email is not critical
      this.logger.error(`Failed to send welcome email: ${error.message}`);
    }
  }

  /**
   * Get subscriber count (for admin)
   */
  async getSubscriberCount(): Promise<number> {
    const result = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM newsletter_subscribers WHERE status = 'subscribed'`
    );
    return parseInt(result.rows[0]?.count || '0', 10);
  }
}
