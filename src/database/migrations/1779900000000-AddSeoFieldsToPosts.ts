import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSeoFieldsToPosts1779900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "posts"
        ADD COLUMN IF NOT EXISTS "focusKeyword" VARCHAR(255),
        ADD COLUMN IF NOT EXISTS "seoScore"     INTEGER,
        ADD COLUMN IF NOT EXISTS "seoGrade"     VARCHAR(10)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "posts"
        DROP COLUMN IF EXISTS "focusKeyword",
        DROP COLUMN IF EXISTS "seoScore",
        DROP COLUMN IF EXISTS "seoGrade"
    `);
  }
}
