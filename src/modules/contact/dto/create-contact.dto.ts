import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum ContactNeed {
  INDUSTRY_SOFTWARE = 'Phần mềm quản lý theo ngành (spa, nhà hàng, phòng khám...)',
  CRM = 'Phần mềm CRM / quản lý khách hàng',
  POS = 'Phần mềm bán hàng & POS',
  WEBSITE = 'Website / landing page',
  MARKETING = 'Phần mềm marketing',
  OTHER = 'Khác',
}

export class CreateContactDto {
  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Họ và tên' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: '0912 345 678', description: 'Số điện thoại' })
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiPropertyOptional({ example: 'email@doanhnghiep.vn', description: 'Email liên hệ' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Công ty ABC', description: 'Tên doanh nghiệp' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  company?: string;

  @ApiProperty({ enum: ContactNeed, example: ContactNeed.INDUSTRY_SOFTWARE, description: 'Nhu cầu' })
  @IsEnum(ContactNeed)
  need: ContactNeed;

  @ApiPropertyOptional({ example: 'Doanh nghiệp đang cần quản lý 3 chi nhánh...', description: 'Mô tả bài toán' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Trang Liên hệ', description: 'Nguồn lead — chỉ dùng để thông báo Telegram, không lưu DB' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  source?: string;
}
