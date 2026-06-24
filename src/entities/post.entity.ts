import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { User } from './user.entity';

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('posts')
@Index(['status', 'publishedAt'])
@Index(['categoryId', 'status'])
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  excerpt: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ nullable: true })
  thumbnail: string;

  @Column({ nullable: true })
  categoryId: number;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: true })
  authorId: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column({ type: 'enum', enum: PostStatus, default: PostStatus.DRAFT })
  @Index()
  status: PostStatus;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column({ length: 255, nullable: true })
  seoTitle: string;

  @Column({ length: 300, nullable: true })
  seoDescription: string;

  @Column({ type: 'text', nullable: true })
  seoKeywords: string;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ length: 255, nullable: true })
  focusKeyword: string;

  @Column({ type: 'int', nullable: true })
  seoScore: number;

  @Column({ length: 10, nullable: true })
  seoGrade: string;

  // ─── Phụ trợ cho category "Phần mềm AI Agent" ─────────────────────────────
  // Logo riêng (khác thumbnail), hiển thị trên nav mega menu + thẻ AI Agent trang chủ
  @Column({ type: 'text', nullable: true })
  logoUrl: string;

  // Badge nổi bật (vd: "Hot", "Mới", "Phổ biến"). Có badge = đủ tiêu chí lên trang chủ.
  @Column({ length: 50, nullable: true })
  badge: string;

  // Tên ngắn — dùng cho nav menu compact (vd: "CSKH", "Sales", "Marketing")
  // Type text (không giới hạn ký tự); menu cho wrap nhiều dòng, sticky bar truncate.
  @Column({ type: 'text', nullable: true })
  shortName: string;

  // Thứ tự hiển thị trên public (thấp → trước)
  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  // Nhóm cha trong nav menu (FK tới NavMenu.id) — quyết định sản phẩm thuộc cột nào trên mega menu
  @Column({ type: 'int', nullable: true })
  @Index()
  menuGroupId: number;

  // Cấu hình toàn bộ 10 section trang chi tiết sản phẩm AI Agent (JSON nullable)
  @Column({ type: 'jsonb', nullable: true })
  productPageConfig: object;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
