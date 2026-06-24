import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSettings } from '../../entities/site-settings.entity';

// Các key chứa thông tin nhạy cảm — KHÔNG trả token ra endpoint public.
const SENSITIVE_KEYS = ['telegram'];

@Injectable()
export class SiteSettingsService {
  constructor(
    @InjectRepository(SiteSettings)
    private repo: Repository<SiteSettings>,
  ) {}

  /** Dùng nội bộ (server-side) — trả nguyên giá trị, không che, không ném lỗi. */
  async getRaw<T = any>(key: string): Promise<T | null> {
    const row = await this.repo.findOne({ where: { key } });
    return row ? (row.value as T) : null;
  }

  /** Public — che field nhạy cảm (vd botToken của telegram). */
  async get(key: string): Promise<object> {
    const row = await this.repo.findOne({ where: { key } });
    if (!row) throw new NotFoundException(`Setting "${key}" không tồn tại`);
    return this.maskSensitive(key, row.value);
  }

  async upsert(key: string, value: object): Promise<object> {
    // Với telegram: nếu không nhập botToken mới (để trống) → giữ token cũ trong DB.
    if (key === 'telegram') {
      const incoming: Record<string, unknown> = { ...(value as Record<string, unknown>) };
      if (!incoming.botToken) {
        const existing = await this.getRaw<Record<string, unknown>>('telegram');
        if (existing?.botToken) incoming.botToken = existing.botToken;
      }
      await this.repo.upsert({ key, value: incoming }, ['key']);
      return this.maskSensitive(key, incoming);
    }

    await this.repo.upsert({ key, value }, ['key']);
    return value;
  }

  private maskSensitive(key: string, value: unknown): Record<string, unknown> {
    if (SENSITIVE_KEYS.includes(key) && value && typeof value === 'object') {
      const v = value as Record<string, unknown>;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { botToken, ...rest } = v;
      return { ...rest, hasToken: !!botToken };
    }
    return (value ?? {}) as Record<string, unknown>;
  }
}
