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

const OUTPUT = path.resolve(__dirname, 'snapshot.json');

async function dump() {
  await dataSource.initialize();
  console.log('📦 Kết nối DB thành công');

  const snapshot = {
    exportedAt: new Date().toISOString(),
    users: await dataSource.getRepository(User).find(),
    categories: await dataSource.getRepository(Category).find(),
    menus: await dataSource.getRepository(Menu).find(),
    menuItems: await dataSource.getRepository(MenuItem).find(),
    posts: await dataSource.getRepository(Post).find({ withDeleted: true }),
    siteSettings: await dataSource.getRepository(SiteSettings).find(),
    media: await dataSource.getRepository(Media).find(),
    contactSubmissions: await dataSource.getRepository(ContactSubmission).find(),
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(snapshot, null, 2), 'utf-8');

  console.log(`✅ Đã dump snapshot ra: ${OUTPUT}`);
  console.log(`   • users:              ${snapshot.users.length}`);
  console.log(`   • categories:         ${snapshot.categories.length}`);
  console.log(`   • menus:              ${snapshot.menus.length}`);
  console.log(`   • menu_items:         ${snapshot.menuItems.length}`);
  console.log(`   • posts:              ${snapshot.posts.length}`);
  console.log(`   • site_settings:      ${snapshot.siteSettings.length}`);
  console.log(`   • media:              ${snapshot.media.length}`);
  console.log(`   • contact_submissions:${snapshot.contactSubmissions.length}`);

  await dataSource.destroy();
}

dump().catch((err) => {
  console.error('❌ Dump thất bại:', err);
  process.exit(1);
});
