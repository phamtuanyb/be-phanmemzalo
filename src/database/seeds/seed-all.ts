import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Category } from '../../entities/category.entity';
import { User } from '../../entities/user.entity';
import { Menu } from '../../entities/menu.entity';
import { MenuItem } from '../../entities/menu-item.entity';
import { Post } from '../../entities/post.entity';
import { SiteSettings } from '../../entities/site-settings.entity';
import { Media } from '../../entities/media.entity';
import { ContactSubmission } from '../../entities/contact-submission.entity';

config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'news_db',
  entities: [User, Category, Menu, MenuItem, Post, SiteSettings, Media, ContactSubmission],
  synchronize: false,
});

const SNAPSHOT = path.resolve(__dirname, 'snapshot.json');

// Bật bằng `npm run seed:all -- --reset` để TRUNCATE sạch trước khi restore (cẩn thận: mất hết data hiện có).
const RESET = process.argv.includes('--reset');

async function bulkInsert(table: string, rows: any[]) {
  if (!rows.length) return;
  const sample = rows[0];
  const columns = Object.keys(sample).filter((k) => sample[k] !== undefined);
  const colSql = columns.map((c) => `"${c}"`).join(', ');

  // Insert từng dòng để dễ ON CONFLICT theo PK.
  for (const row of rows) {
    const values = columns.map((c) => row[c]);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    await dataSource.query(
      `INSERT INTO "${table}" (${colSql}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
      values,
    );
  }
}

async function resetSequence(table: string, idCol = 'id') {
  await dataSource.query(
    `SELECT setval(pg_get_serial_sequence('"${table}"', '${idCol}'),
       COALESCE((SELECT MAX("${idCol}") FROM "${table}"), 1), true)`,
  );
}

async function run() {
  if (!fs.existsSync(SNAPSHOT)) {
    console.error(`❌ Không tìm thấy snapshot: ${SNAPSHOT}`);
    console.error('   Chạy "npm run dump:all" trước trên máy có dữ liệu gốc.');
    process.exit(1);
  }

  await dataSource.initialize();
  console.log('📦 Kết nối DB thành công');

  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf-8'));
  console.log(`📄 Đọc snapshot (export ${snapshot.exportedAt})`);

  if (RESET) {
    console.log('⚠️  RESET mode: xoá sạch dữ liệu hiện tại...');
    await dataSource.query(`
      TRUNCATE TABLE
        "contact_submissions",
        "media",
        "site_settings",
        "menu_items",
        "menus",
        "posts",
        "categories",
        "users"
      RESTART IDENTITY CASCADE
    `);
  }

  // Thứ tự bắt buộc theo FK: users → categories → posts; menus → menu_items.
  await bulkInsert('users', snapshot.users);
  console.log(`✅ users:               ${snapshot.users.length}`);

  await bulkInsert('categories', snapshot.categories);
  console.log(`✅ categories:          ${snapshot.categories.length}`);

  await bulkInsert('menus', snapshot.menus);
  console.log(`✅ menus:               ${snapshot.menus.length}`);

  await bulkInsert('menu_items', snapshot.menuItems);
  console.log(`✅ menu_items:          ${snapshot.menuItems.length}`);

  await bulkInsert('posts', snapshot.posts);
  console.log(`✅ posts:               ${snapshot.posts.length}`);

  await bulkInsert('site_settings', snapshot.siteSettings);
  console.log(`✅ site_settings:       ${snapshot.siteSettings.length}`);

  await bulkInsert('media', snapshot.media);
  console.log(`✅ media:               ${snapshot.media.length}`);

  await bulkInsert('contact_submissions', snapshot.contactSubmissions);
  console.log(`✅ contact_submissions: ${snapshot.contactSubmissions.length}`);

  // Reset sequence để các bản ghi mới (insert sau seed) không bị trùng id.
  for (const t of ['users', 'categories', 'menus', 'menu_items', 'posts', 'media', 'contact_submissions']) {
    await resetSequence(t);
  }
  console.log('✅ Đã reset sequence cho các bảng có SERIAL id');

  await dataSource.destroy();
  console.log('\n🎉 Restore snapshot hoàn tất!');
}

run().catch((err) => {
  console.error('❌ Seed thất bại:', err);
  process.exit(1);
});
