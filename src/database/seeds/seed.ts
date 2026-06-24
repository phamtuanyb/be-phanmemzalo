import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Category, CategoryStatus } from '../../entities/category.entity';
import { User, UserRole, UserStatus } from '../../entities/user.entity';
import { Menu } from '../../entities/menu.entity';
import { MenuItem, MenuItemType } from '../../entities/menu-item.entity';
import { Post } from '../../entities/post.entity';
import { SiteSettings } from '../../entities/site-settings.entity';
import { seedNewsPosts } from './news-posts.seed';
import { seedViaiProducts } from './viai-products.seed';
import { patchServicesFromProd } from './services-from-prod.seed';

config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'news_db',
  entities: [User, Category, Menu, MenuItem, Post, SiteSettings],
  synchronize: true,
});

type SeedMenuItem = {
  label: string;
  url: string;
  children?: SeedMenuItem[];
};

const NAV_MENU_ITEMS: SeedMenuItem[] = [
  { label: 'Trang chủ', url: '/' },
  { label: 'Giới thiệu', url: '/introduction' },
  {
    label: 'Dịch vụ',
    url: '/dich-vu',
    // Children = chỉ là các NHÓM CHA (tiêu đề cột trên mega menu).
    // Sản phẩm con bên dưới mỗi cột tự đọc từ posts (category 'services') theo Post.menuGroupId.
    children: [
      { label: 'Phần mềm & vận hành', url: '#' },
      { label: 'Theo ngành nghề', url: '#' },
      { label: 'Thiết kế & nền tảng', url: '#' },
    ],
  },
  { label: 'Tin tức', url: '/tin-tuc' },
  {
    label: 'PHẦN MỀM XÂY KÊNH',
    url: '/xaykenh',
    // Tương tự Dịch vụ: 2 nhóm cha, sản phẩm tự đọc từ posts (category 'ai-agent') theo Post.menuGroupId.
    children: [
      { label: 'Kinh doanh & khách hàng', url: '#' },
      { label: 'Vận hành & quản trị', url: '#' },
    ],
  },
  { label: 'Liên hệ', url: '/lien-he' },
];

// ── Mapping migration: slug post → label nhóm cha tương ứng ──────────────────
// Khi seed chạy, sẽ tìm post theo slug và gán Post.menuGroupId = id của menu item nhóm cha
const POST_TO_MENU_GROUP: Record<string, string> = {
  // Dịch vụ — Phần mềm & vận hành
  'phan-mem-ban-hang-pos-theo-yeu-cau-quan-ly-da-chi-nhanh-online-offline-lien-mach': 'Phần mềm & vận hành',
  'crm-cho-sme-viet-quan-ly-lead-pipeline-ban-hang-cham-soc-khach-hang-tu-dong': 'Phần mềm & vận hành',
  'phan-mem-quan-ly-kho-wms-xuat-nhap-ton-chinh-xac-canh-bao-hang-sap-het-tu-dong': 'Phần mềm & vận hành',
  'app-ban-hang-da-kenh-web-zalo-mini-app-mobile-dong-bo-ton-kho-va-don-hang-realtime': 'Phần mềm & vận hành',
  'ai-automation-chatbot-workflow-tu-dong-hoa-cham-soc-khach-hang-khong-can-nhan-su-247': 'Phần mềm & vận hành',
  // Dịch vụ — Theo ngành nghề
  'phan-mem-quan-ly-spa-tham-my-vien-dat-lich-thong-minh-cham-khach-tu-dong': 'Theo ngành nghề',
  'phan-mem-quan-ly-nha-khoa-phong-kham-ho-so-benh-nhan-lich-hen-don-thuoc-so': 'Theo ngành nghề',
  'phan-mem-quan-ly-nha-hang-fb-tu-order-den-bep-tu-ship-den-thanh-vien': 'Theo ngành nghề',
  'phan-mem-quan-ly-gym-yoga-fitness-the-tap-lich-lop-pt-nhac-gia-han-tu-dong': 'Theo ngành nghề',
  'phan-mem-quan-ly-trung-tam-dao-tao-hoc-vien-lop-hoc-hoc-phi-mot-noi': 'Theo ngành nghề',
  // Dịch vụ — Thiết kế & nền tảng
  'thiet-ke-website-chuyen-nghiep-uiux-chuan-figma-mobile-first-toi-uu-chuyen-doi': 'Thiết kế & nền tảng',
  'website-landing-page-chuan-seo-tich-hop-crm-tu-dong-cham-soc-lead-tu-lan-click-dau-tien': 'Thiết kế & nền tảng',
  'app-goi-xe-goi-tho-theo-yeu-cau-on-demand-dispatch-tu-dong-tracking-realtime': 'Thiết kế & nền tảng',
  'app-dat-lich-booking-quan-ly-lich-hen-dich-vu-nhac-lich-zalo-oa-giam-no-show': 'Thiết kế & nền tảng',
  'tich-hop-he-thong-ket-noi-misa-zalo-oa-ngan-hang-san-tmdt-du-lieu-chay-tu-dong': 'Thiết kế & nền tảng',
  // AI Agent mapping → quản lý ở viai-products.seed.ts (ViAI Ads/CSKH/Video/SEO)
};

async function seed() {
  await dataSource.initialize();
  console.log('📦 Kết nối database thành công');

  const userRepo = dataSource.getRepository(User);
  const categoryRepo = dataSource.getRepository(Category);

  // ── Admin mặc định ──────────────────────────────────────────────────────
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123456';

  const existingAdmin = await userRepo.findOne({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await userRepo.save(
      userRepo.create({
        email: adminEmail,
        passwordHash,
        fullName: 'Super Admin',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      }),
    );
    console.log(`✅ Admin tạo xong: ${adminEmail}`);
  } else {
    console.log(`⚠️  Admin đã tồn tại: ${adminEmail}`);
  }

  // ── Danh mục mặc định ───────────────────────────────────────────────────
  const defaultCategories = [
    { name: 'Phần mềm AI Agent', slug: 'ai-agent', description: 'Sản phẩm AI Agent (đồng bộ với nav menu + section trang chủ)' },
    { name: 'Dịch vụ', slug: 'services', description: 'Các nhóm dịch vụ MKT Software' },
    { name: 'Tin tức', slug: 'tin-tuc', description: 'Tin tức tổng hợp' },
    { name: 'Công nghệ', slug: 'cong-nghe', description: 'Tin tức công nghệ' },
    { name: 'Kinh tế', slug: 'kinh-te', description: 'Tin tức kinh tế' },
    { name: 'Thể thao', slug: 'the-thao', description: 'Tin tức thể thao' },
    { name: 'Giải trí', slug: 'giai-tri', description: 'Tin tức giải trí' },
    { name: 'Sức khỏe', slug: 'suc-khoe', description: 'Tin tức sức khỏe' },
  ];

  for (const cat of defaultCategories) {
    const exists = await categoryRepo.findOne({ where: { slug: cat.slug } });
    if (!exists) {
      await categoryRepo.save(
        categoryRepo.create({ ...cat, status: CategoryStatus.ACTIVE }),
      );
      console.log(`✅ Danh mục tạo xong: ${cat.name}`);
    } else {
      console.log(`⚠️  Danh mục đã tồn tại: ${cat.name}`);
    }
  }

  // ── Sub-categories của "Tin tức" ────────────────────────────────────────
  const tinTucCat = await categoryRepo.findOne({ where: { slug: 'tin-tuc' } });
  if (tinTucCat) {
    const newsSubCategories = [
      { name: 'Case Study', slug: 'case-study', description: 'Các case study thực tế khách hàng' },
      { name: 'Tin tổng hợp', slug: 'tin-tong-hop', description: 'Tin tức tổng hợp ngành công nghệ' },
      { name: 'Hướng dẫn sử dụng', slug: 'huong-dan-su-dung', description: 'Hướng dẫn sử dụng phần mềm MKT Software' },
      { name: 'Kiến thức Marketing', slug: 'kien-thuc-marketing', description: 'Kiến thức marketing, sales, automation' },
    ];
    for (const sub of newsSubCategories) {
      const exists = await categoryRepo.findOne({ where: { slug: sub.slug } });
      if (!exists) {
        await categoryRepo.save(
          categoryRepo.create({ ...sub, parentId: tinTucCat.id, status: CategoryStatus.ACTIVE }),
        );
        console.log(`✅ Sub-category tạo xong: ${sub.name} (cha: Tin tức)`);
      } else if (exists.parentId !== tinTucCat.id) {
        exists.parentId = tinTucCat.id;
        await categoryRepo.save(exists);
        console.log(`✅ Gắn cha "Tin tức" cho sub: ${sub.name}`);
      }
    }
  }

  // ── Nav Menu (luôn đồng bộ với cấu trúc chuẩn) ──────────────────────────
  const menuRepo = dataSource.getRepository(Menu);
  const itemRepo = dataSource.getRepository(MenuItem);

  let navMenu = await menuRepo.findOne({ where: { slug: 'nav-menu' } });
  if (!navMenu) {
    navMenu = await menuRepo.save(
      menuRepo.create({
        name: 'Nav Menu',
        slug: 'nav-menu',
        description: 'Menu điều hướng chính',
      }),
    );
    console.log('✅ Tạo menu nav-menu');
  }

  await itemRepo.delete({ menuId: navMenu.id });

  const insertItems = async (items: SeedMenuItem[], parentId: number | null, depth: number) => {
    for (let i = 0; i < items.length; i++) {
      const node = items[i];
      const saved = await itemRepo.save(
        itemRepo.create({
          menuId: navMenu!.id,
          label: node.label,
          type: MenuItemType.CUSTOM,
          url: node.url,
          order: i,
          parentId: parentId ?? undefined,
          depth,
        }),
      );
      if (node.children?.length) {
        await insertItems(node.children, saved.id, depth + 1);
      }
    }
  };

  await insertItems(NAV_MENU_ITEMS, null, 0);
  console.log(`✅ Đã đồng bộ nav-menu: ${NAV_MENU_ITEMS.length} mục gốc`);

  // ── Migration: gán Post.menuGroupId theo POST_TO_MENU_GROUP ──────────────
  // Lấy các menu item ở depth=1 dưới "Dịch vụ" và "Phần mềm AI Agent" → map label → id
  const groupItems = await itemRepo.find({ where: { menuId: navMenu.id, depth: 1 } });
  const labelToId = new Map(groupItems.map((m) => [m.label, m.id]));

  const postRepo = dataSource.getRepository(Post);
  let migrated = 0;
  let missing = 0;
  for (const [slug, groupLabel] of Object.entries(POST_TO_MENU_GROUP)) {
    const groupId = labelToId.get(groupLabel);
    if (!groupId) {
      console.warn(`⚠️  Không tìm thấy menu group "${groupLabel}" — bỏ qua post "${slug}"`);
      continue;
    }
    const post = await postRepo.findOne({ where: { slug } });
    if (!post) {
      missing++;
      continue;
    }
    if (post.menuGroupId !== groupId) {
      post.menuGroupId = groupId;
      await postRepo.save(post);
      migrated++;
    }
  }
  console.log(`✅ Migration menuGroupId: ${migrated} post cập nhật, ${missing} post chưa tồn tại trong DB`);

  // ── Seed bài viết mẫu cho các sub-category của "Tin tức" ────────────────
  const adminUser = await userRepo.findOne({ where: { email: adminEmail } });
  if (adminUser) {
    await seedNewsPosts(categoryRepo, postRepo, adminUser.id);
    await seedViaiProducts(categoryRepo, postRepo, itemRepo, navMenu.id, adminUser.id);
    await patchServicesFromProd(postRepo);
  }

  // ── Cam kết (dùng chung toàn website) ─────────────────────────────────
  const settingsRepo = dataSource.getRepository(SiteSettings);
  const existingCommit = await settingsRepo.findOne({ where: { key: 'commitments' } });
  if (!existingCommit) {
    await settingsRepo.save(
      settingsRepo.create({
        key: 'commitments',
        value: {
          heading: 'MKT Software cam kết',
          items: [
            { iconName: 'Zap', title: 'Triển khai 4-8 tuần', description: 'Methodology chia nhỏ module, bàn giao cuốn chiếu. Có demo từng sprint.' },
            { iconName: 'HeartHandshake', title: 'Hỗ trợ 1-1', description: 'Hỗ trợ 1-1 trong suốt quá trình sử dụng phần mềm.' },
            { iconName: 'Wallet', title: 'Hoàn tiền 7 ngày', description: 'Hoàn tiền 100% trong 7 ngày đầu nếu sản phẩm không như mô tả, không hỏi lý do.' },
            { iconName: 'ShieldCheck', title: 'Bảo hành & update miễn phí', description: 'Bảo hành và update miễn phí trọn đời cho gói đã mua.' },
            { iconName: 'GraduationCap', title: 'Cầm tay chỉ việc', description: 'Đào tạo, cầm tay chỉ việc đến khi nhân viên của bạn thành thạo.' },
          ],
        },
      }),
    );
    console.log('✅ Đã tạo cam kết mặc định (5 mục)');
  } else {
    console.log('⚠️  Cam kết đã tồn tại');
  }

  await dataSource.destroy();
  console.log('\n🎉 Seed hoàn tất!');
}

seed().catch((err) => {
  console.error('❌ Seed thất bại:', err);
  process.exit(1);
});
