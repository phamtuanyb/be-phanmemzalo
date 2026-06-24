import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { ContactNeed, CreateContactDto } from './dto/create-contact.dto';

@ApiTags('Contact')
@Controller('api/contact')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gửi yêu cầu tư vấn — gửi email thông báo cho admin' })
  @ApiBody({
    type: CreateContactDto,
    examples: {
      example: {
        summary: 'Yêu cầu tư vấn mẫu',
        value: {
          name: 'Nguyễn Văn A',
          phone: '0912 345 678',
          email: 'email@doanhnghiep.vn',
          company: 'Công ty ABC',
          need: ContactNeed.INDUSTRY_SOFTWARE,
          description: 'Doanh nghiệp đang cần quản lý 3 chi nhánh spa, khoảng 50 nhân viên.',
        },
      },
    },
  })
  async submit(@Body() dto: CreateContactDto) {
    await this.contactService.submit(dto);
    return { message: 'Yêu cầu của bạn đã được gửi. MKT Software sẽ liên hệ trong vòng 2 giờ làm việc.' };
  }
}
