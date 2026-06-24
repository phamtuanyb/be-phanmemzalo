import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SiteSettingsService } from './site-settings.service';
import { TelegramService } from './telegram.service';

@ApiTags('Site Settings')
@Controller('api/settings')
export class SiteSettingsController {
  constructor(
    private service: SiteSettingsService,
    private telegram: TelegramService,
  ) {}

  // Gửi tin test tới Telegram theo config đã lưu (admin). Đặt TRƯỚC route ':key'.
  @Post('telegram/test')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Gửi tin nhắn test tới Telegram (admin)' })
  async testTelegram() {
    await this.telegram.sendTest();
    return { data: { message: 'Đã gửi tin nhắn test tới Telegram thành công.' } };
  }

  @Get(':key')
  @ApiOperation({ summary: 'Lấy setting theo key (public — đã che field nhạy cảm)' })
  get(@Param('key') key: string) {
    return this.service.get(key);
  }

  @Put(':key')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cập nhật setting theo key (admin)' })
  upsert(@Param('key') key: string, @Body() body: object) {
    return this.service.upsert(key, body);
  }
}
