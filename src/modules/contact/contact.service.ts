import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactSubmission } from '../../entities/contact-submission.entity';
import { TelegramService } from '../site-settings/telegram.service';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectRepository(ContactSubmission)
    private submissionRepo: Repository<ContactSubmission>,
    private mailService: MailService,
    private config: ConfigService,
    private telegram: TelegramService,
  ) {}

  async submit(dto: CreateContactDto): Promise<void> {
    await this.submissionRepo.save({
      name: dto.name,
      phone: dto.phone,
      email: dto.email ?? null,
      company: dto.company ?? null,
      need: dto.need,
      description: dto.description ?? null,
    });

    // Gửi lead về Telegram (nếu admin đã bật) — non-blocking, đã tự nuốt lỗi bên trong.
    await this.telegram.notifyLead({
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      company: dto.company,
      need: dto.need,
      description: dto.description,
      source: dto.source,
    });

    // Gửi email thông báo là PHỤ — lead đã lưu ở trên rồi. Lỗi mail (vd SMTP sai)
    // KHÔNG được làm hỏng request, nếu không khách sẽ thấy lỗi dù đã gửi thành công.
    try {
      const adminEmail = this.config.get<string>('CONTACT_RECEIVE_EMAIL', this.config.get('SMTP_FROM_ADDRESS'));

      await this.mailService.send({
        to: adminEmail,
        subject: `[Yêu cầu tư vấn] ${dto.name} — ${dto.phone}`,
        replyTo: dto.email,
        html: this.buildAdminHtml(dto),
      });

      if (dto.email) {
        await this.mailService.send({
          to: dto.email,
          subject: 'MKT Software đã nhận yêu cầu tư vấn của bạn',
          html: this.buildConfirmationHtml(dto),
        });
      }
    } catch (err) {
      this.logger.error(`Lưu lead OK nhưng gửi email thất bại: ${err instanceof Error ? err.message : err}`);
    }
  }

  async findAll(params: { page?: number; limit?: number } = {}): Promise<{ data: ContactSubmission[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const [data, total] = await this.submissionRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async remove(id: number): Promise<void> {
    await this.submissionRepo.delete(id);
  }

  private buildAdminHtml(dto: CreateContactDto): string {
    return `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#1a56db">Yêu cầu tư vấn mới</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb;width:160px"><b>Họ và tên</b></td><td style="padding:8px;border:1px solid #e5e7eb">${dto.name}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb"><b>Số điện thoại</b></td><td style="padding:8px;border:1px solid #e5e7eb"><a href="tel:${dto.phone}">${dto.phone}</a></td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb"><b>Email</b></td><td style="padding:8px;border:1px solid #e5e7eb">${dto.email || '—'}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb"><b>Doanh nghiệp</b></td><td style="padding:8px;border:1px solid #e5e7eb">${dto.company || '—'}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb"><b>Nhu cầu</b></td><td style="padding:8px;border:1px solid #e5e7eb">${dto.need}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb;background:#f9fafb"><b>Mô tả</b></td><td style="padding:8px;border:1px solid #e5e7eb;white-space:pre-wrap">${dto.description || '—'}</td></tr>
        </table>
        <p style="color:#6b7280;font-size:12px;margin-top:16px">Gửi lúc: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</p>
      </div>
    `;
  }

  private buildConfirmationHtml(dto: CreateContactDto): string {
    return `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#1a56db">Xin chào ${dto.name},</h2>
        <p>MKT Software đã nhận được yêu cầu tư vấn của bạn về: <b>${dto.need}</b></p>
        <p>Chúng tôi sẽ liên hệ lại trong vòng <b>2 giờ làm việc</b> qua số điện thoại <b>${dto.phone}</b>.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
        <p style="color:#6b7280;font-size:13px">Nếu bạn cần hỗ trợ gấp, hãy gọi trực tiếp cho chúng tôi.<br>Đội ngũ MKT Software</p>
      </div>
    `;
  }
}
