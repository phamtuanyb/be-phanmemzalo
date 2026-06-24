import { Body, Controller, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SeoAnalyzeDto } from './dto/seo-analyze.dto';
import { SeoRawAnalyzeDto } from './dto/seo-raw-analyze.dto';
import { SeoService } from './seo.service';

@ApiTags('SEO')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/admin')
export class SeoController {
  constructor(private seoService: SeoService) {}

  @Post('posts/:id/seo-score')
  @ApiOperation({ summary: 'Chấm điểm SEO bài viết đã lưu (thang 100 điểm)' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({
    type: SeoAnalyzeDto,
    examples: {
      example: {
        summary: 'Phân tích với từ khóa',
        value: { focusKeyword: 'phần mềm CRM' },
      },
    },
  })
  analyze(@Param('id', ParseIntPipe) id: number, @Body() dto: SeoAnalyzeDto) {
    return this.seoService.analyze(id, dto);
  }

  @Post('seo/analyze')
  @ApiOperation({ summary: 'Chấm điểm SEO realtime từ nội dung thô (không cần lưu bài)' })
  @ApiBody({
    type: SeoRawAnalyzeDto,
    examples: {
      example: {
        summary: 'Phân tích nội dung thô',
        value: {
          focusKeyword: 'phần mềm CRM',
          title: '5 lý do doanh nghiệp cần CRM riêng',
          slug: '5-ly-do-doanh-nghiep-can-crm-rieng',
          seoTitle: '5 lý do doanh nghiệp cần phần mềm CRM riêng',
          seoDescription: 'Phần mềm CRM giúp doanh nghiệp quản lý khách hàng hiệu quả hơn...',
          content: '<h2>Giới thiệu</h2><p>Nội dung bài viết...</p>',
          thumbnail: 'https://example.com/thumb.webp',
        },
      },
    },
  })
  analyzeRaw(@Body() dto: SeoRawAnalyzeDto) {
    return this.seoService.analyzeRaw(dto);
  }
}
