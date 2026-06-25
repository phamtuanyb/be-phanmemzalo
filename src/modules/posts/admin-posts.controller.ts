import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

class CheckSlugQuery {
  @IsString() slug: string;
  @IsOptional() @IsNumber() @Type(() => Number) excludeId?: number;
}

@ApiTags('Posts')
@ApiBearerAuth()
@Controller('api/admin/posts')
@UseGuards(JwtAuthGuard)
export class AdminPostsController {
  constructor(private postsService: PostsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách bài viết (admin)' })
  findAll(@Query() query: QueryPostDto) {
    return this.postsService.findAllAdmin(query);
  }

  @Get('check-slug')
  @ApiOperation({ summary: 'Kiểm tra slug có thể dùng được không' })
  @ApiQuery({ name: 'slug', required: true, example: 'ten-bai-viet-moi' })
  @ApiQuery({ name: 'excludeId', required: false, description: 'ID bài viết đang sửa (để bỏ qua chính nó)', example: 1 })
  checkSlug(@Query() query: CheckSlugQuery) {
    return this.postsService.checkSlugAvailable(query.slug, query.excludeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết bài viết (admin)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOneAdmin(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo bài viết mới' })
  create(@Body() dto: CreatePostDto, @CurrentUser() user: User) {
    return this.postsService.create(dto, user);
  }

  @Post('import-docx')
  @ApiOperation({ summary: 'Import hàng loạt bài viết từ file Word (.docx)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', 100, {
      storage: memoryStorage(),
      limits: { fileSize: 25 * 1024 * 1024 }, // 25MB / file
      fileFilter: (req, file, cb) => {
        const isDocx =
          file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          /\.docx$/i.test(file.originalname);
        if (!isDocx) {
          return cb(new BadRequestException('Chỉ chấp nhận file Word .docx (không hỗ trợ .doc cũ)'), false);
        }
        cb(null, true);
      },
    }),
  )
  importDocx(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { categoryId?: string },
    @CurrentUser() user: User,
  ) {
    if (!files?.length) throw new BadRequestException('Chưa chọn file .docx nào');
    const categoryId = body.categoryId ? Number(body.categoryId) : undefined;
    return this.postsService.importDocx(files, { categoryId }, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Sửa bài viết' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePostDto) {
    return this.postsService.update(id, dto);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish bài viết' })
  publish(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.publish(id);
  }

  @Patch(':id/draft')
  @ApiOperation({ summary: 'Chuyển bài về nháp' })
  draft(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.draft(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa bài viết (soft delete)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.remove(id);
  }
}
