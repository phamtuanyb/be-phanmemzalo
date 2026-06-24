import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SeoAnalyzeDto {
  @ApiProperty({ example: 'phần mềm CRM', description: 'Từ khóa chính cần phân tích' })
  @IsString()
  @MinLength(1)
  focusKeyword: string;
}
