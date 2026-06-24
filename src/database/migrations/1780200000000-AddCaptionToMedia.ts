import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCaptionToMedia1780200000000 implements MigrationInterface {
  name = 'AddCaptionToMedia1780200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "caption" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "media" DROP COLUMN IF EXISTS "caption"`);
  }
}
