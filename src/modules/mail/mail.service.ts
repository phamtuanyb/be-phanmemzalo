import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface MailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;
  private enabled: boolean;

  constructor(private config: ConfigService) {
    this.enabled = this.config.get<string>('EMAIL_ENABLED', 'false') === 'true';

    if (this.enabled) {
      this.transporter = nodemailer.createTransport({
        host: this.config.get('SMTP_HOST'),
        port: this.config.get<number>('SMTP_PORT', 465),
        secure: this.config.get<string>('SMTP_SECURE', 'true') === 'true',
        auth: {
          user: this.config.get('SMTP_USER'),
          pass: this.config.get('SMTP_PASSWORD'),
        },
      });
    }
  }

  async send(opts: MailOptions): Promise<void> {
    if (!this.enabled) {
      this.logger.warn(`Email disabled — would send to ${opts.to}: ${opts.subject}`);
      return;
    }

    const fromName = this.config.get('SMTP_FROM_NAME', 'MKT Software');
    const fromAddr = this.config.get('SMTP_FROM_ADDRESS');

    try {
      await this.transporter.sendMail({
        from: `"${fromName}" <${fromAddr}>`,
        to: Array.isArray(opts.to) ? opts.to.join(', ') : opts.to,
        subject: opts.subject,
        html: opts.html,
        replyTo: opts.replyTo,
      });
      this.logger.log(`Email sent to ${opts.to}: ${opts.subject}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${opts.to}`, err);
      throw err;
    }
  }
}
