import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, Min, ValidateNested } from 'class-validator';

export class ReorderItemDto {
  @ApiProperty({ example: 1, description: 'ID của menu item' })
  @IsInt()
  id: number;

  @ApiPropertyOptional({ example: null, description: 'ID item cha (null = top-level)' })
  @IsOptional()
  @IsInt()
  parentId?: number;

  @ApiProperty({ example: 0, description: 'Thứ tự mới' })
  @IsInt()
  @Min(0)
  order: number;
}

export class ReorderMenuItemsDto {
  @ApiProperty({ type: [ReorderItemDto], description: 'Danh sách items với thứ tự và parentId mới' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}
