import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMenuDto {
  @ApiProperty({ example: 'Header Menu', description: 'Tên menu' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'header-menu', description: 'Slug (tự tạo nếu không điền)' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'Menu hiển thị ở header', description: 'Mô tả menu' })
  @IsOptional()
  @IsString()
  description?: string;
}
