import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../../entities/category.entity';
import { Post } from '../../entities/post.entity';
import { SeoModule } from '../seo/seo.module';
import { AdminPostsController } from './admin-posts.controller';
import { PublicPostsController } from './public-posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Category]), SeoModule],
  controllers: [AdminPostsController, PublicPostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
