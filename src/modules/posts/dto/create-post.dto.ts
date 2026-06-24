import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { PostStatus } from '../../../entities/post.entity';

export class CreatePostDto {
  @ApiProperty({ example: 'NestJS là gì? Tìm hiểu framework Node.js mạnh mẽ', description: 'Tiêu đề bài viết' })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'nestjs-la-gi-tim-hieu-framework-nodejs', description: 'Slug URL (tự sinh nếu bỏ trống)' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional({ example: 'NestJS là một framework Node.js mạnh mẽ được xây dựng trên TypeScript.' })
  @IsString()
  @IsOptional()
  excerpt?: string;

  @ApiPropertyOptional({
    example: '<h2>Giới thiệu</h2><p>NestJS là framework Node.js hiện đại.</p><img src="http://localhost:3001/uploads/anh-minh-hoa.jpg" alt="Ảnh minh họa" /><p>Nội dung tiếp theo...</p>',
    description: 'Nội dung HTML đầy đủ. Ảnh nhúng bằng thẻ <img src="URL từ /api/admin/media/upload">',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ example: 'http://localhost:3001/uploads/thumbnail.jpg' })
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID danh mục (mặc định về Tin tức nếu bỏ trống)' })
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @ApiPropertyOptional({ enum: PostStatus, example: PostStatus.DRAFT })
  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;

  @ApiPropertyOptional({ example: 'NestJS là gì? Hướng dẫn đầy đủ 2024' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'Tìm hiểu NestJS framework Node.js: cài đặt, cấu trúc, module, controller, service.' })
  @IsString()
  @IsOptional()
  @MaxLength(300)
  seoDescription?: string;

  @ApiPropertyOptional({ example: 'nestjs, nodejs, typescript, framework' })
  @IsString()
  @IsOptional()
  seoKeywords?: string;

  @ApiPropertyOptional({ example: 'nestjs framework nodejs', description: 'Từ khóa chính để chấm điểm SEO' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  focusKeyword?: string;

  @ApiPropertyOptional({ example: 'http://localhost:3001/uploads/ai-agent-sales-logo.png', description: 'Logo riêng cho sản phẩm AI Agent (khác thumbnail bài viết)' })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'Hot', description: 'Badge nổi bật (Hot, Mới, Phổ biến...). Có badge → hiện trên section AI Agent trang chủ.' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  badge?: string;

  @ApiPropertyOptional({ example: 'CSKH', description: 'Tên ngắn dùng cho nav menu compact (không giới hạn ký tự, menu cho wrap nhiều dòng)' })
  @IsString()
  @IsOptional()
  shortName?: string;

  @ApiPropertyOptional({ example: 1, description: 'Thứ tự hiển thị trên public (thấp → trước)' })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({ example: 5, description: 'ID nhóm cha trong nav-menu (vd "Phần Mềm & Vận Hành"). Quyết định cột hiển thị trên mega menu.' })
  @IsNumber()
  @IsOptional()
  menuGroupId?: number;

  @ApiPropertyOptional({ description: 'JSON config 10 section trang chi tiết AI Agent' })
  @IsOptional()
  productPageConfig?: object;
}
