import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../entities/post.entity';
import { SeoAnalyzeDto } from './dto/seo-analyze.dto';
import { SeoRawAnalyzeDto } from './dto/seo-raw-analyze.dto';

interface PostData {
  title: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  content: string;
  thumbnail: string;
}

interface SeoCheck {
  id: string;
  label: string;
  status: 'good' | 'warning' | 'error';
  score: number;
  maxScore: number;
  detail?: string;
}

interface SeoSection {
  label: string;
  score: number;
  maxScore: number;
  checks: SeoCheck[];
}

export interface SeoScoreResult {
  score: number;
  maxScore: 100;
  grade: 'good' | 'ok' | 'poor';
  focusKeyword: string;
  sections: {
    basicSeo: SeoSection;
    additional: SeoSection;
    titleReadability: SeoSection;
    contentReadability: SeoSection;
  };
}

@Injectable()
export class SeoService {
  constructor(@InjectRepository(Post) private postRepo: Repository<Post>) {}

  analyzeRaw(dto: SeoRawAnalyzeDto): SeoScoreResult {
    return this.score(dto.focusKeyword, {
      title: dto.title || '',
      slug: dto.slug || '',
      seoTitle: dto.seoTitle || '',
      seoDescription: dto.seoDescription || '',
      content: dto.content || '',
      thumbnail: dto.thumbnail || '',
    });
  }

  async analyze(postId: number, dto: SeoAnalyzeDto): Promise<SeoScoreResult> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Bài viết không tồn tại');

    return this.score(dto.focusKeyword, {
      title: post.title || '',
      slug: post.slug || '',
      seoTitle: post.seoTitle || '',
      seoDescription: post.seoDescription || '',
      content: post.content || '',
      thumbnail: post.thumbnail || '',
    });
  }

  private score(focusKeyword: string, data: PostData): SeoScoreResult {
    const kw = focusKeyword.trim().toLowerCase();
    const title = data.title.toLowerCase();
    const slug = data.slug.toLowerCase();
    const content = data.content;
    const contentLower = content.toLowerCase();
    const seoTitle = data.seoTitle.toLowerCase();
    const seoDesc = data.seoDescription.toLowerCase();
    const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = plainText.split(' ').filter(Boolean).length;

    // ── SEO cơ bản (40đ) ────────────────────────────────────────────────────
    const kwInSeoTitle = seoTitle.includes(kw);
    const kwInTitle = title.includes(kw);
    const kwInTitleScore = kwInSeoTitle ? 7 : kwInTitle ? 4 : 0;

    const kwDensity = wordCount > 0
      ? (contentLower.split(kw).length - 1) / wordCount
      : 0;
    const kwInContentScore = !contentLower.includes(kw) ? 0 : kwDensity >= 0.01 ? 7 : 5;

    const contentLengthScore =
      wordCount >= 2500 ? 6 :
      wordCount >= 1500 ? 4 :
      wordCount >= 800  ? 2 : 0;

    const basicChecks: SeoCheck[] = [
      this.check(
        'kw_in_seo_title',
        'Từ khóa chính trong tiêu đề SEO',
        kwInTitleScore, 7,
        kwInSeoTitle
          ? `SEO title có từ khóa`
          : kwInTitle
            ? `Từ khóa có trong title nhưng chưa có trong SEO title`
            : `Tiêu đề chưa chứa từ khóa`,
      ),
      this.check(
        'kw_in_meta_desc',
        'Từ khóa chính trong meta description',
        seoDesc.includes(kw) ? 7 : 0, 7,
        seoDesc ? `Meta description ${seoDesc.includes(kw) ? 'có' : 'chưa có'} từ khóa` : 'Chưa có meta description',
      ),
      this.check(
        'kw_in_slug',
        'Từ khóa chính trong đường dẫn (URL)',
        slug.includes(kw.replace(/\s+/g, '-')) || slug.includes(kw.replace(/\s+/g, '')) ? 7 : 0, 7,
        `Slug: "${data.slug}"`,
      ),
      this.check(
        'kw_in_heading',
        'Từ khóa chính trong heading (H1/H2)',
        this.kwInHeadings(content, kw) ? 6 : 0, 6,
        this.kwInHeadings(content, kw) ? 'Tìm thấy từ khóa trong heading' : 'Chưa có heading chứa từ khóa',
      ),
      this.check(
        'kw_in_content',
        'Từ khóa chính trong nội dung bài viết',
        kwInContentScore, 7,
        !contentLower.includes(kw)
          ? 'Nội dung chưa chứa từ khóa'
          : kwDensity >= 0.01
            ? `Mật độ từ khóa tốt (${(kwDensity * 100).toFixed(1)}%)`
            : `Từ khóa xuất hiện nhưng mật độ thấp (${(kwDensity * 100).toFixed(1)}%)`,
      ),
      this.check(
        'content_length',
        'Nội dung đủ dài (≥ 2500 từ)',
        contentLengthScore, 6,
        `Nội dung có ${wordCount} từ — ${
          wordCount >= 2500 ? 'tốt' :
          wordCount >= 1500 ? 'đạt (cần ≥ 2500 để tối ưu)' :
          wordCount >= 800  ? 'còn ngắn (cần ≥ 1500)' : 'quá ngắn (cần ≥ 800)'
        }`,
      ),
    ];

    // ── Bổ sung (20đ) ────────────────────────────────────────────────────────
    const descLen = data.seoDescription?.length || 0;
    const metaDescLengthScore =
      descLen >= 120 && descLen <= 160 ? 3 :
      (descLen >= 100 && descLen < 120) || (descLen > 160 && descLen <= 180) ? 2 :
      (descLen >= 50  && descLen < 100) || (descLen > 180 && descLen <= 220) ? 1 : 0;

    const effectiveTitle = data.seoTitle || data.title;
    const titleLen = effectiveTitle?.length || 0;
    const seoTitleLengthScore =
      titleLen >= 50 && titleLen <= 60 ? 3 :
      (titleLen >= 40 && titleLen < 50) || (titleLen > 60 && titleLen <= 70) ? 2 :
      (titleLen >= 30 && titleLen < 40) || (titleLen > 70 && titleLen <= 80) ? 1 : 0;

    const slugLen = data.slug?.length || 0;
    const slugLengthScore =
      slugLen > 0 && slugLen < 50  ? 3 :
      slugLen >= 50 && slugLen < 75 ? 2 :
      slugLen >= 75 && slugLen <= 100 ? 1 : 0;

    const additionalChecks: SeoCheck[] = [
      this.check(
        'has_meta_desc',
        'Có meta description',
        data.seoDescription ? 3 : 0, 3,
        data.seoDescription ? `Độ dài: ${descLen} ký tự` : 'Chưa nhập meta description',
      ),
      this.check(
        'meta_desc_length',
        'Meta description đúng độ dài (120–160 ký tự)',
        metaDescLengthScore, 3,
        data.seoDescription
          ? `${descLen} ký tự — ${descLen >= 120 && descLen <= 160 ? 'tối ưu' : descLen < 120 ? 'quá ngắn' : 'quá dài'} (tối ưu: 120–160)`
          : 'Chưa có meta description',
      ),
      this.check(
        'seo_title_length',
        'SEO title đúng độ dài (50–60 ký tự)',
        seoTitleLengthScore, 3,
        `${titleLen} ký tự — ${titleLen >= 50 && titleLen <= 60 ? 'tối ưu' : titleLen < 50 ? 'quá ngắn' : 'quá dài'} (tối ưu: 50–60)`,
      ),
      this.check(
        'slug_length',
        'Đường dẫn ngắn gọn (< 75 ký tự)',
        slugLengthScore, 3,
        `Slug có ${slugLen} ký tự — ${slugLen < 50 ? 'tốt' : slugLen < 75 ? 'chấp nhận được' : slugLen <= 100 ? 'hơi dài' : 'quá dài'}`,
      ),
      this.check(
        'has_thumbnail',
        'Có ảnh đại diện (thumbnail)',
        data.thumbnail ? 4 : 0, 4,
        data.thumbnail ? 'Đã có thumbnail' : 'Chưa có thumbnail',
      ),
      this.check(
        'has_links',
        'Có liên kết trong nội dung',
        /<a\s/i.test(content) ? 4 : 0, 4,
        /<a\s/i.test(content) ? 'Tìm thấy liên kết trong bài viết' : 'Chưa có liên kết nội bộ/ngoại',
      ),
    ];

    // ── Khả năng đọc tiêu đề (15đ) ───────────────────────────────────────────
    const kwIdx = effectiveTitle?.toLowerCase().indexOf(kw.toLowerCase()) ?? -1;
    const kwNearStartScore =
      kwIdx === -1 ? 0 :
      kwIdx <= Math.floor(titleLen / 3) ? 8 :
      kwIdx <= Math.floor((titleLen * 2) / 3) ? 4 : 0;

    const titleChecks: SeoCheck[] = [
      this.check(
        'kw_near_title_start',
        'Từ khóa gần đầu tiêu đề',
        kwNearStartScore, 8,
        kwIdx === -1
          ? 'Từ khóa không có trong tiêu đề'
          : kwNearStartScore === 8
            ? 'Từ khóa nằm trong 1/3 đầu tiêu đề — tốt'
            : kwNearStartScore === 4
              ? 'Từ khóa nằm ở giữa tiêu đề — nên đưa lên đầu hơn'
              : 'Từ khóa nằm ở cuối tiêu đề',
      ),
      this.check(
        'title_has_number',
        'Tiêu đề có chứa số (cải thiện CTR)',
        /\d/.test(effectiveTitle || '') ? 7 : 0, 7,
        'Tiêu đề có số giúp tăng tỉ lệ click (VD: "5 cách...", "2026...")',
      ),
    ];

    // ── Khả năng đọc nội dung (25đ) ──────────────────────────────────────────
    const h2h3Count = (content.match(/<h[23]/gi) || []).length;
    const headingsScore =
      h2h3Count >= 3 ? 8 :
      h2h3Count === 2 ? 6 :
      h2h3Count === 1 ? 4 : 0;

    const imgCount = (content.match(/<img\s/gi) || []).length;
    const imagesScore =
      imgCount >= 3 ? 10 :
      imgCount === 2 ? 7 :
      imgCount === 1 ? 4 : 0;

    const shortParaScore = this.paragraphScore(content);

    const contentChecks: SeoCheck[] = [
      this.check(
        'has_headings',
        'Có mục lục / heading H2, H3',
        headingsScore, 8,
        h2h3Count === 0
          ? 'Nên thêm H2/H3 để chia nhỏ nội dung'
          : `Có ${h2h3Count} heading — ${h2h3Count >= 3 ? 'tốt' : 'nên thêm để cấu trúc rõ hơn'}`,
      ),
      this.check(
        'short_paragraphs',
        'Đoạn văn ngắn gọn (< 300 từ/đoạn)',
        shortParaScore, 7,
        'Đoạn văn ngắn giúp dễ đọc hơn trên mobile',
      ),
      this.check(
        'has_images',
        'Có hình ảnh trong nội dung',
        imagesScore, 10,
        imgCount === 0
          ? 'Nên thêm ít nhất 1 hình ảnh'
          : `Có ${imgCount} hình ảnh — ${imgCount >= 3 ? 'tốt' : 'nên thêm để tăng điểm'}`,
      ),
    ];

    const sections = {
      basicSeo: this.buildSection('SEO cơ bản', basicChecks),
      additional: this.buildSection('Bổ sung', additionalChecks),
      titleReadability: this.buildSection('Khả năng đọc tiêu đề', titleChecks),
      contentReadability: this.buildSection('Khả năng đọc nội dung', contentChecks),
    };

    const totalScore = Object.values(sections).reduce((sum, s) => sum + s.score, 0);
    const grade = totalScore >= 70 ? 'good' : totalScore >= 40 ? 'ok' : 'poor';

    return { score: totalScore, maxScore: 100, grade, focusKeyword, sections };
  }

  // score: actual points earned (0..maxScore). Status derived automatically.
  private check(id: string, label: string, score: number, maxScore: number, detail?: string): SeoCheck {
    const status = score === maxScore ? 'good' : score > 0 ? 'warning' : 'error';
    return { id, label, status, score, maxScore, detail };
  }

  private buildSection(label: string, checks: SeoCheck[]): SeoSection {
    return {
      label,
      score: checks.reduce((s, c) => s + c.score, 0),
      maxScore: checks.reduce((s, c) => s + c.maxScore, 0),
      checks,
    };
  }

  private kwInHeadings(content: string, kw: string): boolean {
    const matches = content.match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi) || [];
    return matches.some((h) => h.toLowerCase().replace(/<[^>]*>/g, '').includes(kw));
  }

  private paragraphScore(content: string): number {
    const paras = content.match(/<p[^>]*>(.*?)<\/p>/gi) || [];
    if (paras.length === 0) return 0;
    const longRatio =
      paras.filter((p) => p.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length > 300).length /
      paras.length;
    return longRatio === 0 ? 7 : longRatio < 0.15 ? 5 : longRatio < 0.3 ? 3 : 0;
  }
}
