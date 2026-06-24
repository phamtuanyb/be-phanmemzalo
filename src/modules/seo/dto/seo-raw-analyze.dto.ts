import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class SeoRawAnalyzeDto {
  @ApiProperty({ example: 'phần mềm CRM', description: 'Từ khóa chính' })
  @IsString()
  @MinLength(1)
  focusKeyword: string;

  @ApiPropertyOptional({ example: '5 lý do doanh nghiệp cần CRM riêng' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'ly-do-can-crm-rieng' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: '5 lý do doanh nghiệp cần phần mềm CRM riêng' })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'Phần mềm CRM giúp doanh nghiệp quản lý khách hàng hiệu quả hơn...' })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional({ description: 'Nội dung HTML đầy đủ của bài viết' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: 'https://example.com/thumbnail.webp' })
  @IsOptional()
  @IsString()
  thumbnail?: string;
}
