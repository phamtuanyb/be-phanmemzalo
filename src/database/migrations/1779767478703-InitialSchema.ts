import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1779767478703 implements MigrationInterface {
  name = 'InitialSchema1779767478703';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Enums ────────────────────────────────────────────────────────────────
    await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'user'); EXCEPTION WHEN duplicate_object THEN null; END $$`);
    await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'inactive'); EXCEPTION WHEN duplicate_object THEN null; END $$`);
    await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."categories_status_enum" AS ENUM('active', 'inactive'); EXCEPTION WHEN duplicate_object THEN null; END $$`);
    await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."posts_status_enum" AS ENUM('draft', 'published', 'archived'); EXCEPTION WHEN duplicate_object THEN null; END $$`);
    await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."menu_items_type_enum" AS ENUM('page', 'post', 'category', 'custom'); EXCEPTION WHEN duplicate_object THEN null; END $$`);

    // ── users ────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id"               SERIAL PRIMARY KEY,
        "email"            character varying NOT NULL UNIQUE,
        "passwordHash"     character varying NOT NULL,
        "fullName"         character varying(255) NOT NULL,
        "role"             "public"."users_role_enum" NOT NULL DEFAULT 'user',
        "status"           "public"."users_status_enum" NOT NULL DEFAULT 'active',
        "refreshTokenHash" text,
        "createdAt"        TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"        TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // ── categories ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id"          SERIAL PRIMARY KEY,
        "name"        character varying(255) NOT NULL,
        "slug"        character varying NOT NULL UNIQUE,
        "description" text,
        "parentId"    integer,
        "status"      "public"."categories_status_enum" NOT NULL DEFAULT 'active',
        "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_categories_parent" FOREIGN KEY ("parentId")
          REFERENCES "categories"("id") ON DELETE RESTRICT
      )
    `);

    // ── posts ─────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "posts" (
        "id"             SERIAL PRIMARY KEY,
        "title"          character varying(255) NOT NULL,
        "slug"           character varying NOT NULL UNIQUE,
        "excerpt"        text,
        "content"        text,
        "thumbnail"      character varying,
        "categoryId"     integer,
        "authorId"       integer,
        "status"         "public"."posts_status_enum" NOT NULL DEFAULT 'draft',
        "publishedAt"    TIMESTAMP,
        "seoTitle"       character varying(255),
        "seoDescription" character varying(300),
        "seoKeywords"    text,
        "viewCount"      integer NOT NULL DEFAULT 0,
        "createdAt"      TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"      TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt"      TIMESTAMP,
        CONSTRAINT "FK_posts_category" FOREIGN KEY ("categoryId")
          REFERENCES "categories"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_posts_author" FOREIGN KEY ("authorId")
          REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_posts_status_publishedAt" ON "posts" ("status", "publishedAt")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_posts_categoryId_status" ON "posts" ("categoryId", "status")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_posts_status" ON "posts" ("status")`);

    // ── media ─────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "media" (
        "id"        SERIAL PRIMARY KEY,
        "url"       character varying NOT NULL,
        "fileName"  character varying(255) NOT NULL,
        "mimeType"  character varying(100) NOT NULL,
        "size"      integer NOT NULL,
        "altText"   character varying(255),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // ── menus ─────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "menus" (
        "id"          SERIAL PRIMARY KEY,
        "name"        character varying(255) NOT NULL,
        "slug"        character varying NOT NULL UNIQUE,
        "description" text,
        "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // ── menu_items ────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "menu_items" (
        "id"        SERIAL PRIMARY KEY,
        "menuId"    integer NOT NULL,
        "label"     character varying(255) NOT NULL,
        "type"      "public"."menu_items_type_enum" NOT NULL DEFAULT 'custom',
        "targetId"  integer,
        "url"       text,
        "order"     integer NOT NULL DEFAULT 0,
        "parentId"  integer,
        "depth"     integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_menu_items_menu" FOREIGN KEY ("menuId")
          REFERENCES "menus"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_menu_items_parent" FOREIGN KEY ("parentId")
          REFERENCES "menu_items"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "menu_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "menus"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "media"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_posts_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_posts_categoryId_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_posts_status_publishedAt"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "posts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."menu_items_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."posts_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."categories_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_role_enum"`);
  }
}
