import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

const config = () => ({
  mock: process.env.MAILER_MOCK === 'true',
  host: process.env.MAILER_HOST ?? 'smtp.ethereal.email',
  port: Number(process.env.MAILER_PORT ?? 587),
  user: process.env.MAILER_USER ?? '',
  pass: process.env.MAILER_PASS ?? '',
  from: process.env.MAILER_FROM ?? 'no-reply@onthi2029.vn',
});

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;
  /** Hàng đợi mail đã gửi ở chế độ mock — dùng cho dev & test. */
  private readonly inbox: SendMailOptions[] = [];

  constructor() {
    const { mock, host, port, user, pass } = config();
    this.transporter = mock
      ? nodemailer.createTransport({ jsonTransport: true })
      : nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: user ? { user, pass } : undefined,
        });
  }

  get mockInbox(): SendMailOptions[] {
    return this.inbox;
  }

  async send(options: SendMailOptions): Promise<void> {
    const { mock, from } = config();
    try {
      const info = (await this.transporter.sendMail({
        from,
        ...options,
      })) as { messageId: string; message: unknown };
      if (mock) {
        // jsonTransport trả về message dạng JSON — đẩy vào inbox để đọc trong test
        const raw =
          typeof info.message === 'string'
            ? info.message
            : ((
                info.message as { toString?: () => string } | undefined
              )?.toString?.() ?? '');
        this.inbox.push(options);
        this.logger.log(`[MAILER MOCK] ${options.subject} -> ${options.to}`);
        if (raw) this.logger.debug(raw);
      } else {
        this.logger.log(
          `[MAILER] ${options.subject} -> ${options.to} (id=${info.messageId})`,
        );
      }
    } catch (err) {
      this.logger.error(
        `[MAILER] Gửi mail thất bại: ${err instanceof Error ? err.message : err}`,
      );
    }
  }
}
