import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductFieldsToPosts1780400000000 implements MigrationInterface {
  name = 'AddProductFieldsToPosts1780400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "posts"
        ADD COLUMN IF NOT EXISTS "logoUrl"           text,
        ADD COLUMN IF NOT EXISTS "badge"             character varying(50),
        ADD COLUMN IF NOT EXISTS "shortName"         text,
        ADD COLUMN IF NOT EXISTS "displayOrder"      integer NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "menuGroupId"       integer,
        ADD COLUMN IF NOT EXISTS "productPageConfig" jsonb
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_posts_menuGroupId" ON "posts" ("menuGroupId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_posts_menuGroupId"`);
    await queryRunner.query(`
      ALTER TABLE "posts"
        DROP COLUMN IF EXISTS "productPageConfig",
        DROP COLUMN IF EXISTS "menuGroupId",
        DROP COLUMN IF EXISTS "displayOrder",
        DROP COLUMN IF EXISTS "shortName",
        DROP COLUMN IF EXISTS "badge",
        DROP COLUMN IF EXISTS "logoUrl"
    `);
  }
}
