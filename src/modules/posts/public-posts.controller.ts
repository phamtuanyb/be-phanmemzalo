import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { QueryPostDto } from './dto/query-post.dto';
import { PostsService } from './posts.service';

@ApiTags('Posts')
@Controller('api')
export class PublicPostsController {
  constructor(private postsService: PostsService) {}

  @Get('posts')
  @ApiOperation({ summary: 'Danh sách bài viết đã publish (public)' })
  findAll(@Query() query: QueryPostDto) {
    return this.postsService.findPublished(query);
  }

  @Get('posts/:slug')
  @ApiOperation({ summary: 'Chi tiết bài viết theo slug (public)' })
  findOne(@Param('slug') slug: string) {
    return this.postsService.findPublishedBySlug(slug);
  }

  @Get('categories/:slug/posts')
  @ApiOperation({ summary: 'Danh sách bài viết theo danh mục (public)' })
  findByCategorySlug(@Param('slug') slug: string, @Query() query: QueryPostDto) {
    return this.postsService.findByCategorySlug(slug, query);
  }
}
