import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { CategoryStatus } from '../../../entities/category.entity';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Công nghệ', description: 'Tên danh mục' })
  @IsString()
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'cong-nghe', description: 'Slug URL' })
  @IsString()
  @IsNotEmpty({ message: 'Slug không được để trống' })
  @MaxLength(255)
  slug: string;

  @ApiPropertyOptional({ example: 'Tin tức về công nghệ, AI, lập trình' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: null, description: 'ID danh mục cha (nếu có)' })
  @IsNumber()
  @IsOptional()
  parentId?: number;

  @ApiPropertyOptional({ enum: CategoryStatus, example: CategoryStatus.ACTIVE })
  @IsEnum(CategoryStatus)
  @IsOptional()
  status?: CategoryStatus;
}
