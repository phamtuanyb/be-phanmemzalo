import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { MenuItemType } from '../../../entities/menu-item.entity';

export class UpdateMenuItemDto {
  @ApiPropertyOptional({ example: 'Sản Phẩm' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  label?: string;

  @ApiPropertyOptional({ enum: MenuItemType })
  @IsOptional()
  @IsEnum(MenuItemType)
  type?: MenuItemType;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  targetId?: number;

  @ApiPropertyOptional({ example: '/san-pham' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  @IsInt()
  parentId?: number;
}
