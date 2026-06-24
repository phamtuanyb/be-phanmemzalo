import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { Post } from '../../entities/post.entity';
import { generateSlug } from '../../common/utils/slug.util';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Post) private postRepo: Repository<Post>,
  ) {}

  async findAll() {
    return this.categoryRepo.find({
      relations: ['parent', 'children'],
      order: { createdAt: 'ASC' },
    });
  }

  async findAllActive() {
    return this.categoryRepo.find({
      where: { status: 'active' as any },
      relations: ['children'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    if (!category) throw new NotFoundException('Danh mục không tồn tại');
    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.categoryRepo.findOne({ where: { slug } });
    if (!category) throw new NotFoundException('Danh mục không tồn tại');
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const slug = dto.slug || generateSlug(dto.name);
    await this.checkSlugUnique(slug);

    if (dto.parentId) {
      const parent = await this.categoryRepo.findOne({ where: { id: dto.parentId } });
      if (!parent) throw new BadRequestException('Danh mục cha không tồn tại');
    }

    const category = this.categoryRepo.create({ ...dto, slug });
    return this.categoryRepo.save(category);
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    if (dto.slug && dto.slug !== category.slug) {
      await this.checkSlugUnique(dto.slug);
    }

    if (dto.parentId && dto.parentId !== category.parentId) {
      if (dto.parentId === id) throw new BadRequestException('Danh mục không thể là cha của chính nó');
      const parent = await this.categoryRepo.findOne({ where: { id: dto.parentId } });
      if (!parent) throw new BadRequestException('Danh mục cha không tồn tại');
    }

    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  async remove(id: number) {
    const category = await this.findOne(id);

    const postCount = await this.postRepo.count({ where: { categoryId: id } });
    if (postCount > 0) {
      throw new BadRequestException(`Không thể xóa: danh mục đang có ${postCount} bài viết`);
    }

    const childCount = await this.categoryRepo.count({ where: { parentId: id } });
    if (childCount > 0) {
      throw new BadRequestException('Không thể xóa: danh mục đang có danh mục con, hãy chuyển danh mục con trước');
    }

    return this.categoryRepo.remove(category);
  }

  private async checkSlugUnique(slug: string, excludeId?: number) {
    const existing = await this.categoryRepo.findOne({ where: { slug } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(`Slug "${slug}" đã tồn tại`);
    }
  }
}
