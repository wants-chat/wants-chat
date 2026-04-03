import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { SESService } from '../email/ses.service';
import { ContactFormDto, ContactSubjectType, ContactResponse } from './dto/contact.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  private readonly supportEmail: string;
  private readonly fromEmail: string;
  private readonly frontendUrl: string;

  constructor(
    private readonly db: DatabaseService,
    private readonly sesService: SESService,
    private readonly configService: ConfigService,
  ) {
    this.supportEmail = this.configService.get('SUPPORT_EMAIL', 'support@wants.chat');
    this.fromEmail = this.configService.get('EMAIL_DEFAULT_FROM', 'noreply@wants.chat');
    this.frontendUrl = this.configService.get('FRONTEND_URL', 'https://wants.chat');
  }

  /**
   * Submit contact form
   * - Sends notification email to support team (with reply-to user's email)
   * - Sends confirmation email to user
   */
  async submitContactForm(dto: ContactFormDto): Promise<ContactResponse> {
    const ticketId = uuidv4().slice(0, 8).toUpperCase();

    try {
      // 1. Store contact submission in database
      await this.saveContactSubmission(ticketId, dto);

      // 2. Send notification email to support team
      await this.sendTeamNotification(ticketId, dto);

      // 3. Send confirmation email to user
      await this.sendUserConfirmation(ticketId, dto);

      this.logger.log(`Contact form submitted: ${ticketId} from ${dto.email}`);

      return {
        success: true,
        message: 'Thank you for your message! We will get back to you within 24 hours.',
        ticketId,
      };
    } catch (error) {
      this.logger.error(`Contact form error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Save contact submission to database
   */
  private async saveContactSubmission(ticketId: string, dto: ContactFormDto): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO contact_submissions
         (id, ticket_id, name, email, subject, subject_type, message, company, phone, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', NOW())`,
        [
          uuidv4(),
          ticketId,
          dto.name,
          dto.email.toLowerCase().trim(),
          dto.subject,
          dto.subjectType || 'general',
          dto.message,
          dto.company || null,
          dto.phone || null,
        ]
      );
    } catch (error) {
      this.logger.error(`Failed to save contact submission: ${error.message}`);
      // Don't throw - still try to send emails
    }
  }

  /**
   * Send notification email to support team
   */
  private async sendTeamNotification(ticketId: string, dto: ContactFormDto): Promise<void> {
    const subjectLabel = this.getSubjectLabel(dto.subjectType);
    const emailSubject = `[Wants Contact #${ticketId}] ${subjectLabel} from ${dto.name}`;

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
            <td style="background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); padding: 30px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">New Contact Form Submission</h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Ticket ID: #${ticketId}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color: #1e293b; padding: 30px; border-radius: 0 0 16px 16px;">
              <!-- Contact Info Table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
                <tr>
                  <td style="padding: 12px; background-color: #334155; border-radius: 8px 8px 0 0; border-bottom: 1px solid #475569;">
                    <strong style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Name</strong><br>
                    <span style="color: #e2e8f0; font-size: 16px;">${dto.name}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px; background-color: #334155; border-bottom: 1px solid #475569;">
                    <strong style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Email</strong><br>
                    <a href="mailto:${dto.email}" style="color: #10b981; font-size: 16px; text-decoration: none;">${dto.email}</a>
                  </td>
                </tr>
                ${dto.company ? `
                <tr>
                  <td style="padding: 12px; background-color: #334155; border-bottom: 1px solid #475569;">
                    <strong style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Company</strong><br>
                    <span style="color: #e2e8f0; font-size: 16px;">${dto.company}</span>
                  </td>
                </tr>
                ` : ''}
                ${dto.phone ? `
                <tr>
                  <td style="padding: 12px; background-color: #334155; border-bottom: 1px solid #475569;">
                    <strong style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Phone</strong><br>
                    <span style="color: #e2e8f0; font-size: 16px;">${dto.phone}</span>
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 12px; background-color: #334155; border-bottom: 1px solid #475569;">
                    <strong style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Subject Type</strong><br>
                    <span style="color: #10b981; font-size: 16px;">${subjectLabel}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px; background-color: #334155; border-radius: 0 0 8px 8px;">
                    <strong style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Subject</strong><br>
                    <span style="color: #e2e8f0; font-size: 16px;">${dto.subject}</span>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <strong style="color: #475569; font-size: 12px; text-transform: uppercase; display: block; margin-bottom: 10px;">Message</strong>
                <p style="color: #1e293b; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${this.escapeHtml(dto.message)}</p>
              </div>

              <!-- Reply Button -->
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); border-radius: 8px;">
                    <a href="mailto:${dto.email}?subject=Re: ${encodeURIComponent(dto.subject)} [#${ticketId}]" style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px;">
                      Reply to ${dto.name}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; text-align: center;">
              <p style="color: #64748b; font-size: 12px; margin: 0;">
                Submitted at: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })} (JST)
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
New Contact Form Submission
Ticket ID: #${ticketId}

Contact Information:
- Name: ${dto.name}
- Email: ${dto.email}
${dto.company ? `- Company: ${dto.company}` : ''}
${dto.phone ? `- Phone: ${dto.phone}` : ''}
- Subject Type: ${subjectLabel}
- Subject: ${dto.subject}

Message:
${dto.message}

---
Submitted at: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })} (JST)
Reply to: ${dto.email}
    `;

    await this.sesService.sendEmail({
      to: this.supportEmail,
      from: this.fromEmail,
      replyTo: dto.email,
      subject: emailSubject,
      html,
      text,
      tags: [
        { Name: 'type', Value: 'contact_form' },
        { Name: 'ticket_id', Value: ticketId },
      ],
    });

    this.logger.log(`Team notification sent for ticket #${ticketId}`);
  }

  /**
   * Send confirmation email to user
   */
  private async sendUserConfirmation(ticketId: string, dto: ContactFormDto): Promise<void> {
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
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Thank You for Contacting Us!</h1>
              <p style="margin: 16px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">We've received your message</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color: #1e293b; padding: 40px; border-radius: 0 0 16px 16px;">
              <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi ${dto.name},
              </p>
              <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for reaching out to us. We've received your message and our team will review it shortly.
              </p>
              <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                <strong style="color: #10b981;">Your ticket ID is: #${ticketId}</strong><br>
                Please keep this ID for your reference.
              </p>

              <!-- Message Summary -->
              <div style="background-color: #334155; border-radius: 8px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #10b981;">
                <strong style="color: #94a3b8; font-size: 12px; text-transform: uppercase; display: block; margin-bottom: 10px;">Your Message</strong>
                <p style="color: #e2e8f0; font-size: 14px; line-height: 1.6; margin: 0;"><strong>Subject:</strong> ${dto.subject}</p>
                <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 10px 0 0 0; white-space: pre-wrap;">${this.escapeHtml(dto.message.substring(0, 500))}${dto.message.length > 500 ? '...' : ''}</p>
              </div>

              <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                We typically respond within <strong style="color: #e2e8f0;">24 hours</strong> during business days. If your matter is urgent, feel free to reply to this email.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); border-radius: 12px;">
                    <a href="${this.frontendUrl}" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                      Visit Wants
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
                <a href="${this.frontendUrl}/support" style="color: #10b981; text-decoration: none;">Support</a>
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
Thank You for Contacting Us!

Hi ${dto.name},

Thank you for reaching out to us. We've received your message and our team will review it shortly.

Your ticket ID is: #${ticketId}
Please keep this ID for your reference.

Your Message:
Subject: ${dto.subject}
${dto.message}

We typically respond within 24 hours during business days. If your matter is urgent, feel free to reply to this email.

---
© ${new Date().getFullYear()} Info Inlet. All rights reserved.
Visit us: ${this.frontendUrl}
    `;

    await this.sesService.sendEmail({
      to: dto.email,
      from: this.fromEmail,
      replyTo: this.supportEmail,
      subject: `Thank you for contacting Wants [#${ticketId}]`,
      html,
      text,
      tags: [
        { Name: 'type', Value: 'contact_confirmation' },
        { Name: 'ticket_id', Value: ticketId },
      ],
    });

    this.logger.log(`User confirmation sent to ${dto.email} for ticket #${ticketId}`);
  }

  /**
   * Get human-readable label for subject type
   */
  private getSubjectLabel(subjectType?: ContactSubjectType): string {
    const labels: Record<ContactSubjectType, string> = {
      [ContactSubjectType.GENERAL]: 'General Inquiry',
      [ContactSubjectType.SUPPORT]: 'Customer Support',
      [ContactSubjectType.SALES]: 'Sales Inquiry',
      [ContactSubjectType.PARTNERSHIP]: 'Partnership',
      [ContactSubjectType.FEEDBACK]: 'Feedback',
      [ContactSubjectType.BUG_REPORT]: 'Bug Report',
      [ContactSubjectType.OTHER]: 'Other',
    };
    return labels[subjectType || ContactSubjectType.GENERAL];
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
