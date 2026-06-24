import { MigrationInterface, QueryRunner } from 'typeorm';

const DEFAULT_FOOTER = {
  brand: {
    tagline: 'Phần mềm theo yêu cầu, vừa vặn cho doanh nghiệp Việt. Giải quyết bài toán thực chiến — không phải trang trí công nghệ.',
    ecosystemLabel: 'Thuộc hệ sinh thái',
    ecosystemName: 'ViTechGroup',
    socials: [
      { type: 'facebook', href: '#' },
      { type: 'zalo',     href: '#' },
      { type: 'youtube',  href: '#' },
    ],
  },
  columns: [
    {
      title: 'Dịch vụ',
      links: [
        { icon: '⚙️', label: 'Phần mềm theo yêu cầu', href: '/services/phan-mem-ban-hang' },
        { icon: '👥', label: 'CRM & Bán hàng',         href: '/services/crm-cho-sme' },
        { icon: '📱', label: 'App Mobile',              href: '/services/app-ban-hang' },
        { icon: '🤖', label: 'AI & Automation',         href: '/services/ai-automation' },
        { icon: '🌐', label: 'Website & Landing',       href: '/services/website-landing' },
        { icon: '🎨', label: 'Thiết kế Website',        href: '/services/thiet-ke-website' },
      ],
    },
    {
      title: 'Công ty',
      links: [
        { icon: '🏢', label: 'Về MKT Software',       href: '/introduction' },
        { icon: '🔄', label: 'Quy trình làm việc', href: '/#how-it-works' },
        { icon: '📝', label: 'Blog công nghệ',      href: '/category/tin-tuc' },
        { icon: '💼', label: 'Liên hệ hợp tác',    href: '/contact' },
      ],
    },
    {
      title: 'Liên hệ',
      links: [
        { icon: '✉️', label: 'hello@vsoftware.vn', href: 'mailto:hello@vsoftware.vn' },
        { icon: '🌍', label: 'vsoftware.vn',        href: '/' },
        { icon: '📘', label: 'Facebook',            href: '#' },
        { icon: '💬', label: 'Zalo OA',             href: 'https://zalo.me/vsoftware' },
      ],
    },
  ],
  copyright: '© {year} MKT Software · ViTechGroup · All rights reserved.',
  legalLinks: [
    { label: 'Chính sách bảo mật', href: '#' },
    { label: 'Điều khoản sử dụng', href: '#' },
  ],
};

export class AddSiteSettings1780100000000 implements MigrationInterface {
  name = 'AddSiteSettings1780100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "site_settings" (
        "key"       character varying PRIMARY KEY,
        "value"     jsonb NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(
      `INSERT INTO "site_settings" ("key", "value")
       VALUES ('footer', $1::jsonb)
       ON CONFLICT ("key") DO NOTHING`,
      [JSON.stringify(DEFAULT_FOOTER)],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "site_settings" WHERE "key" = 'footer'`);
    await queryRunner.query(`DROP TABLE IF EXISTS "site_settings"`);
  }
}
