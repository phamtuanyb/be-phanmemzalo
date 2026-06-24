import { MigrationInterface, QueryRunner } from 'typeorm';

// Password hash cho "vitechgroup" (bcrypt rounds=12)
const ROOT_PASSWORD_HASH = '$2a$12$BLrwplRVMkNpnM7Y7Pl8ie4sGwhf1tARLJ47GLYqriTVYu9AK/hUS';

export class SeedDefaultData1779768372040 implements MigrationInterface {
  name = 'SeedDefaultData1779768372040';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Admin mặc định ──────────────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO "users" ("email", "passwordHash", "fullName", "role", "status")
      VALUES ('root@vsoftware.vn', '${ROOT_PASSWORD_HASH}', 'Root Admin', 'admin', 'active')
      ON CONFLICT ("email") DO NOTHING
    `);

    // ── Danh mục mặc định ───────────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO "categories" ("name", "slug", "description", "status") VALUES
        ('Tin tức',   'tin-tuc',   'Tin tức tổng hợp',  'active'),
        ('Công nghệ', 'cong-nghe', 'Tin tức công nghệ', 'active'),
        ('Kinh tế',   'kinh-te',   'Tin tức kinh tế',   'active'),
        ('Thể thao',  'the-thao',  'Tin tức thể thao',  'active'),
        ('Giải trí',  'giai-tri',  'Tin tức giải trí',  'active'),
        ('Sức khỏe',  'suc-khoe',  'Tin tức sức khỏe',  'active')
      ON CONFLICT ("slug") DO NOTHING
    `);

    // ── Menu điều hướng mặc định ─────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO "menus" ("name", "slug", "description")
      VALUES ('Nav Menu', 'nav-menu', 'Menu điều hướng chính')
      ON CONFLICT ("slug") DO NOTHING
    `);

    // ── Items cho nav-menu ───────────────────────────────────────────────────
    await queryRunner.query(`
      INSERT INTO "menu_items" ("menuId", "label", "type", "url", "order", "depth")
      SELECT m.id, 'Trang chủ', 'custom', '/', 0, 0
      FROM "menus" m WHERE m.slug = 'nav-menu'
      AND NOT EXISTS (
        SELECT 1 FROM "menu_items" mi WHERE mi."menuId" = m.id AND mi."label" = 'Trang chủ'
      )
    `);

    await queryRunner.query(`
      INSERT INTO "menu_items" ("menuId", "label", "type", "url", "order", "depth")
      SELECT m.id, 'Tin tức', 'custom', '/tin-tuc', 1, 0
      FROM "menus" m WHERE m.slug = 'nav-menu'
      AND NOT EXISTS (
        SELECT 1 FROM "menu_items" mi WHERE mi."menuId" = m.id AND mi."label" = 'Tin tức'
      )
    `);

    await queryRunner.query(`
      INSERT INTO "menu_items" ("menuId", "label", "type", "url", "order", "depth")
      SELECT m.id, 'Liên hệ', 'custom', '/lien-he', 2, 0
      FROM "menus" m WHERE m.slug = 'nav-menu'
      AND NOT EXISTS (
        SELECT 1 FROM "menu_items" mi WHERE mi."menuId" = m.id AND mi."label" = 'Liên hệ'
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "menu_items" WHERE "menuId" IN (SELECT id FROM "menus" WHERE slug = 'nav-menu')`);
    await queryRunner.query(`DELETE FROM "menus" WHERE "slug" = 'nav-menu'`);
    await queryRunner.query(`DELETE FROM "categories" WHERE "slug" IN ('tin-tuc','cong-nghe','kinh-te','the-thao','giai-tri','suc-khoe')`);
    await queryRunner.query(`DELETE FROM "users" WHERE "email" = 'root@vsoftware.vn'`);
  }
}
