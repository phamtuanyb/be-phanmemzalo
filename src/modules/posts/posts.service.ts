import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateSlug } from '../../common/utils/slug.util';
import { Category } from '../../entities/category.entity';
import { Post, PostStatus } from '../../entities/post.entity';
import { User } from '../../entities/user.entity';
import { SeoService } from '../seo/seo.service';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostDto, SortBy, SortOrder } from './dto/query-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

const DEFAULT_CATEGORY_SLUG = 'tin-tuc';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postRepo: Repository<Post>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    private seoService: SeoService,
  ) {}

  // ─── PUBLIC ───────────────────────────────────────────────────────────────

  async findPublished(query: QueryPostDto) {
    const {
      page = 1, limit = 10, search, category, categoryId,
      sortBy = SortBy.PUBLISHED_AT, sortOrder = SortOrder.DESC,
    } = query;

    const qb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.status = :status', { status: PostStatus.PUBLISHED })
      .andWhere('post.deletedAt IS NULL')
      .select([
        'post.id', 'post.title', 'post.slug', 'post.excerpt',
        'post.thumbnail', 'post.publishedAt', 'post.createdAt', 'post.viewCount',
        'post.seoTitle', 'post.seoDescription', 'post.seoKeywords', 'post.updatedAt',
        'post.logoUrl', 'post.badge', 'post.shortName', 'post.displayOrder', 'post.menuGroupId', 'post.productPageConfig',
        'category.id', 'category.name', 'category.slug',
        'author.id', 'author.fullName',
      ])
      .orderBy(`post.${sortBy}`, sortOrder);

    if (search) {
      qb.andWhere('(post.title LIKE :search OR post.excerpt LIKE :search)', {
        search: `%${search}%`,
      });
    }
    if (category) {
      qb.andWhere('category.slug = :category', { category });
    }
    if (categoryId) {
      qb.andWhere('post.categoryId = :categoryId', { categoryId });
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findPublishedBySlug(slug: string) {
    const post = await this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.slug = :slug', { slug })
      .andWhere('post.status = :status', { status: PostStatus.PUBLISHED })
      .andWhere('post.deletedAt IS NULL')
      .getOne();

    if (!post) throw new NotFoundException('Bài viết không tồn tại hoặc chưa được xuất bản');

    // Tăng view count bất đồng bộ, không ảnh hưởng response
    this.postRepo.increment({ id: post.id }, 'viewCount', 1).catch(() => {});

    return post;
  }

  async findByCategorySlug(categorySlug: string, query: QueryPostDto) {
    const {
      page = 1, limit = 10, all = false,
      sortBy = SortBy.PUBLISHED_AT, sortOrder = SortOrder.DESC,
    } = query;

    const root = await this.categoryRepo.findOne({ where: { slug: categorySlug } });
    if (!root) throw new NotFoundException('Danh mục không tồn tại');

    const categoryIds = await this.collectCategoryIds(root.id);

    const qb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.status = :status', { status: PostStatus.PUBLISHED })
      .andWhere('post.deletedAt IS NULL')
      .andWhere('post.categoryId IN (:...categoryIds)', { categoryIds })
      .select([
        'post.id', 'post.title', 'post.slug', 'post.excerpt',
        'post.thumbnail', 'post.publishedAt', 'post.createdAt', 'post.viewCount',
        'post.logoUrl', 'post.badge', 'post.shortName', 'post.displayOrder', 'post.menuGroupId', 'post.productPageConfig',
        'category.id', 'category.name', 'category.slug',
        'author.id', 'author.fullName',
      ])
      .orderBy(`post.${sortBy}`, sortOrder);

    if (!all) {
      qb.skip((page - 1) * limit).take(limit);
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: all
        ? { total }
        : { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  private async collectCategoryIds(rootId: number): Promise<number[]> {
    const all = await this.categoryRepo.find({ select: ['id', 'parentId'] });
    const ids: number[] = [];
    const queue = [rootId];
    while (queue.length) {
      const current = queue.shift()!;
      ids.push(current);
      all.filter((c) => c.parentId === current).forEach((c) => queue.push(c.id));
    }
    return ids;
  }

  // ─── ADMIN ────────────────────────────────────────────────────────────────

  async findAllAdmin(query: QueryPostDto) {
    const { page = 1, limit = 20, search, status, categoryId } = query;
    const qb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.author', 'author')
      .withDeleted()
      .where('post.deletedAt IS NULL')
      .orderBy('post.createdAt', 'DESC');

    if (search) {
      qb.andWhere('post.title LIKE :search', { search: `%${search}%` });
    }
    if (status) {
      qb.andWhere('post.status = :status', { status });
    }
    if (categoryId) {
      qb.andWhere('post.categoryId = :categoryId', { categoryId });
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOneAdmin(id: number) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['category', 'author'],
    });
    if (!post) throw new NotFoundException('Bài viết không tồn tại');
    return post;
  }

  async create(dto: CreatePostDto, author: User) {
    const slug = await this.resolveSlug(dto.slug, dto.title);
    const categoryId = dto.categoryId ?? await this.getDefaultCategoryId();

    const post = this.postRepo.create({
      ...dto,
      slug,
      categoryId,
      authorId: author.id,
      status: dto.status ?? PostStatus.DRAFT,
    });
    const saved = await this.postRepo.save(post);
    return this.computeAndSaveSeoScore(saved);
  }

  async update(id: number, dto: UpdatePostDto) {
    const post = await this.findOneAdmin(id);

    if (dto.slug) {
      dto.slug = generateSlug(dto.slug);
      if (dto.slug !== post.slug) {
        await this.checkSlugUnique(dto.slug, id);
      }
    }

    Object.assign(post, dto);
    const saved = await this.postRepo.save(post);
    return this.computeAndSaveSeoScore(saved);
  }

  async checkSlugAvailable(slug: string, excludeId?: number): Promise<{ available: boolean; slug: string }> {
    const normalized = generateSlug(slug);
    const existing = await this.postRepo.findOne({ where: { slug: normalized } });
    const available = !existing || existing.id === excludeId;
    return { available, slug: normalized };
  }

  private async computeAndSaveSeoScore(post: Post): Promise<Post> {
    const kw = post.focusKeyword?.trim();
    if (!kw) return post;

    const result = this.seoService.analyzeRaw({
      focusKeyword: kw,
      title: post.title || '',
      slug: post.slug || '',
      seoTitle: post.seoTitle || '',
      seoDescription: post.seoDescription || '',
      content: post.content || '',
      thumbnail: post.thumbnail || '',
    });

    await this.postRepo.update(post.id, { seoScore: result.score, seoGrade: result.grade });
    post.seoScore = result.score;
    post.seoGrade = result.grade;
    return post;
  }

  async publish(id: number) {
    const post = await this.findOneAdmin(id);

    if (!post.title) throw new BadRequestException('Bài viết cần có tiêu đề');
    if (!post.content) throw new BadRequestException('Bài viết cần có nội dung');
    if (!post.categoryId) throw new BadRequestException('Bài viết cần có danh mục');
    if (!post.slug) throw new BadRequestException('Bài viết cần có slug');

    post.status = PostStatus.PUBLISHED;
    if (!post.publishedAt) post.publishedAt = new Date();

    return this.postRepo.save(post);
  }

  async draft(id: number) {
    const post = await this.findOneAdmin(id);
    post.status = PostStatus.DRAFT;
    return this.postRepo.save(post);
  }

  async remove(id: number) {
    const post = await this.findOneAdmin(id);
    return this.postRepo.softRemove(post);
  }

  // ─── PRIVATE ──────────────────────────────────────────────────────────────

  private async getDefaultCategoryId(): Promise<number | undefined> {
    const cat = await this.categoryRepo.findOne({ where: { slug: DEFAULT_CATEGORY_SLUG } });
    return cat?.id;
  }

  private async resolveSlug(slug: string | undefined, title: string): Promise<string> {
    const base = generateSlug(slug || title);
    await this.checkSlugUnique(base);
    return base;
  }

  private async checkSlugUnique(slug: string, excludeId?: number) {
    const existing = await this.postRepo.findOne({ where: { slug } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(`Slug "${slug}" đã tồn tại`);
    }
  }
}
