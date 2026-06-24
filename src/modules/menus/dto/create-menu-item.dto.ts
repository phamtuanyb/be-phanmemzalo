import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { MenuItemType } from '../../../entities/menu-item.entity';

export class CreateMenuItemDto {
  @ApiProperty({ example: 'Trang chủ', description: 'Nhãn hiển thị của item' })
  @IsString()
  @MaxLength(255)
  label: string;

  @ApiProperty({ enum: MenuItemType, example: MenuItemType.CUSTOM, description: 'Loại liên kết' })
  @IsEnum(MenuItemType)
  type: MenuItemType;

  @ApiPropertyOptional({ example: 1, description: 'ID của page/post/category (nếu type không phải custom)' })
  @IsOptional()
  @IsInt()
  targetId?: number;

  @ApiPropertyOptional({ example: 'https://example.com', description: 'URL tùy chọn (dùng khi type = custom)' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ example: 0, description: 'Thứ tự hiển thị (số nhỏ lên trước)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ example: null, description: 'ID item cha (null = top-level)' })
  @IsOptional()
  @IsInt()
  parentId?: number;
}
