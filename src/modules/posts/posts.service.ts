import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as mammoth from 'mammoth';
import { generateSlug } from '../../common/utils/slug.util';
import { Category } from '../../entities/category.entity';
import { Post, PostStatus } from '../../entities/post.entity';
import { User } from '../../entities/user.entity';
import { MediaService } from '../media/media.service';
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
    private mediaService: MediaService,
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

  /**
   * Import hàng loạt bài viết từ file Word (.docx).
   * - Tiêu đề = tên file (đã dọn). Nội dung = HTML từ mammoth (giữ link/backlink, heading, list, bảng).
   * - Ảnh nhúng trong Word → trích ra → WebP qua MediaService → src tương đối /uploads/...
   * - Ảnh đầu tiên → thumbnail. Mặc định trạng thái Nháp. Slug trùng → thêm -2, -3...
   */
  async importDocx(
    files: Express.Multer.File[],
    opts: { categoryId?: number },
    author: User,
  ) {
    const categoryId = opts.categoryId ?? (await this.getDefaultCategoryId());

    // Word Heading 1 → <h2> (vì <h1> dành cho tiêu đề trang). Mammoth tự xử lý link/list/bảng/đậm-nghiêng.
    const styleMap = [
      "p[style-name='Title'] => h2:fresh",
      "p[style-name='Heading 1'] => h2:fresh",
      "p[style-name='Heading 2'] => h3:fresh",
      "p[style-name='Heading 3'] => h4:fresh",
      "p[style-name='Heading 4'] => h5:fresh",
    ];

    const usedSlugs = new Set<string>(); // tránh trùng slug giữa các file trong cùng 1 lần import
    const items: Array<{
      file: string;
      ok: boolean;
      postId?: number;
      slug?: string;
      error?: string;
    }> = [];
    let success = 0;

    for (const file of files) {
      try {
        const title = this.docxFilenameToTitle(file.originalname);
        const images: string[] = [];

        const result = await mammoth.convertToHtml(
          { buffer: file.buffer },
          {
            styleMap,
            convertImage: mammoth.images.imgElement(async (image) => {
              const buffer = await image.read();
              const media = await this.mediaService.saveBuffer(buffer, { altText: title });
              const relUrl = `/uploads/${media.fileName}`; // tương đối → chạy đúng mọi domain
              images.push(relUrl);
              return { src: relUrl };
            }),
          },
        );

        const content = result.value;
        const excerpt = this.htmlToExcerpt(content);
        const slug = await this.resolveUniqueSlugBatch(title, usedSlugs);
        usedSlugs.add(slug);

        const post = this.postRepo.create({
          title: title.slice(0, 255),
          slug,
          content,
          excerpt,
          thumbnail: images[0] ?? null,
          categoryId,
          authorId: author.id,
          status: PostStatus.DRAFT,
          seoTitle: title.slice(0, 255),
          seoDescription: excerpt.slice(0, 300),
        });
        const saved = await this.postRepo.save(post);

        items.push({ file: file.originalname, ok: true, postId: saved.id, slug });
        success++;
      } catch (err) {
        items.push({
          file: file.originalname,
          ok: false,
          error: err instanceof Error ? err.message : 'Lỗi không xác định',
        });
      }
    }

    return { total: files.length, success, failed: files.length - success, items };
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

  // Tên file .docx → tiêu đề: bỏ đuôi, đổi _ và - thành khoảng trắng, gộp khoảng trắng thừa.
  private docxFilenameToTitle(filename: string): string {
    // Multer/busboy decode tên file theo latin1 → tiếng Việt bị lỗi font. Decode lại về UTF-8.
    const utf8 = Buffer.from(filename, 'latin1').toString('utf8');
    const safe = utf8.includes('�') ? filename : utf8; // nếu hỏng thì giữ nguyên gốc
    const noExt = safe.replace(/\.docx$/i, '');
    const cleaned = noExt.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
    return cleaned || 'Bài viết';
  }

  // HTML → đoạn mô tả ngắn (~160 ký tự) để làm excerpt/seoDescription.
  private htmlToExcerpt(html: string): string {
    const text = html
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (text.length <= 160) return text;
    return text.slice(0, 160).replace(/\s+\S*$/, '') + '…';
  }

  // Sinh slug duy nhất: kiểm tra cả DB lẫn các slug đã dùng trong batch hiện tại.
  private async resolveUniqueSlugBatch(title: string, used: Set<string>): Promise<string> {
    const base = generateSlug(title) || 'bai-viet';
    let candidate = base;
    let i = 2;
    while (used.has(candidate) || (await this.postRepo.findOne({ where: { slug: candidate } }))) {
      candidate = `${base}-${i++}`;
    }
    return candidate;
  }

  private async checkSlugUnique(slug: string, excludeId?: number) {
    const existing = await this.postRepo.findOne({ where: { slug } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(`Slug "${slug}" đã tồn tại`);
    }
  }
}
