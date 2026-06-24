import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MediaService } from './media.service';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/tiff', 'image/bmp'];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB trước khi convert (AVIF/TIFF có thể lớn hơn)

@ApiTags('Media')
@ApiBearerAuth()
@Controller('api/admin/media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(
    private mediaService: MediaService,
    private configService: ConfigService,
  ) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload ảnh — tự động convert sang WebP' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_SIZE },
      fileFilter: (req, file, cb) => {
        if (!ALLOWED_TYPES.includes(file.mimetype)) {
          return cb(
            new BadRequestException('Chỉ cho phép upload ảnh: jpg, png, webp, gif, avif, tiff, bmp'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { altText?: string; caption?: string },
  ) {
    if (!file) throw new BadRequestException('Không có file được gửi lên');
    return this.mediaService.saveUpload(file, body);
  }

  @Post('import-url')
  @ApiOperation({ summary: 'Tải ảnh từ URL về server, convert sang WebP' })
  async importUrl(@Body() body: { url: string; altText?: string; caption?: string }) {
    if (!body.url) throw new BadRequestException('URL là bắt buộc');
    return this.mediaService.importFromUrl(body.url, { altText: body.altText, caption: body.caption });
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách file đã upload' })
  findAll() {
    return this.mediaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết file' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật metadata (fileName, altText, caption)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { fileName?: string; altText?: string; caption?: string },
  ) {
    return this.mediaService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa file (xóa cả file vật lý)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.remove(id);
  }
}
