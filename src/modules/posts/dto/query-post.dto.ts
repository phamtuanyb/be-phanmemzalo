import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { PostStatus } from '../../../entities/post.entity';

export enum SortBy {
  PUBLISHED_AT = 'publishedAt',
  VIEW_COUNT = 'viewCount',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class QueryPostDto {
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @IsOptional()
  @Min(1)
  limit?: number = 10;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  all?: boolean = false;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;

  @IsEnum(SortBy)
  @IsOptional()
  sortBy?: SortBy = SortBy.PUBLISHED_AT;

  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.DESC;
}
