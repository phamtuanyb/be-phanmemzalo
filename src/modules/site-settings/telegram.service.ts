import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { SiteSettingsService } from './site-settings.service';

export interface TelegramConfig {
  enabled?: boolean;
  botToken?: string;
  chatId?: string;
}

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(private settings: SiteSettingsService) {}

  private async getConfig(): Promise<TelegramConfig | null> {
    return this.settings.getRaw<TelegramConfig>('telegram');
  }

  /** Gửi 1 message tới Telegram. Ném lỗi nếu thất bại (caller tự quyết nuốt hay không). */
  async sendRaw(botToken: string, chatId: string, text: string): Promise<void> {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Telegram API ${res.status}: ${body}`);
    }
  }

  /** Gửi thông báo theo config đã lưu — chỉ gửi khi enabled + có đủ token/chatId. */
  async notify(text: string): Promise<void> {
    const cfg = await this.getConfig();
    if (!cfg?.enabled || !cfg.botToken || !cfg.chatId) return;
    await this.sendRaw(cfg.botToken, cfg.chatId, text);
  }

  /** Test gửi — bỏ qua cờ enabled, chỉ cần token + chatId đã lưu. */
  async sendTest(): Promise<void> {
    const cfg = await this.getConfig();
    if (!cfg?.botToken || !cfg.chatId) {
      throw new BadRequestException('Chưa cấu hình Bot Token và Chat ID. Hãy lưu trước khi test.');
    }
    await this.sendRaw(
      cfg.botToken,
      cfg.chatId,
      '✅ <b>Kết nối Telegram thành công!</b>\nTừ giờ lead đăng ký dùng thử sẽ được gửi về đây.',
    );
  }

  /** Định dạng + gửi 1 lead. Không ném lỗi ra ngoài (để không làm hỏng request lưu lead). */
  async notifyLead(lead: {
    name: string;
    phone: string;
    email?: string | null;
    company?: string | null;
    need?: string | null;
    description?: string | null;
    source?: string | null;
  }): Promise<void> {
    const esc = (s?: string | null) =>
      (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const lines = [
      '🔔 <b>LEAD ĐĂNG KÝ MỚI</b>',
      '',
      `👤 <b>Họ tên:</b> ${esc(lead.name)}`,
      `📞 <b>SĐT:</b> ${esc(lead.phone)}`,
    ];
    if (lead.email) lines.push(`✉️ <b>Email:</b> ${esc(lead.email)}`);
    if (lead.company) lines.push(`🏢 <b>Doanh nghiệp:</b> ${esc(lead.company)}`);
    if (lead.need) lines.push(`🎯 <b>Nhu cầu:</b> ${esc(lead.need)}`);
    if (lead.description) lines.push(`📝 <b>Lời nhắn:</b> ${esc(lead.description)}`);
    if (lead.source) lines.push(`📍 <b>Nguồn:</b> ${esc(lead.source)}`);
    try {
      await this.notify(lines.join('\n'));
    } catch (err) {
      this.logger.error(`Gửi lead về Telegram thất bại: ${err instanceof Error ? err.message : err}`);
    }
  }
}
