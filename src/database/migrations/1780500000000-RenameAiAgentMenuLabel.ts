import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameAiAgentMenuLabel1780500000000 implements MigrationInterface {
  name = 'RenameAiAgentMenuLabel1780500000000';

  // Đổi nav menu "Phần mềm AI Agent" → "Phần mềm Xây kênh" và url → /xaykenh.
  // Category slug trong DB vẫn giữ 'ai-agent' (posts/products không đổi); chỉ đổi nhãn + đường dẫn public.
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "menu_items" SET "label" = 'Phần mềm Xây kênh' WHERE "label" = 'Phần mềm AI Agent'`,
    );
    await queryRunner.query(
      `UPDATE "menu_items" SET "url" = '/xaykenh' WHERE "url" IN ('/ai-agent', '/xaykenh-ai')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "menu_items" SET "url" = '/ai-agent' WHERE "url" = '/xaykenh'`,
    );
    await queryRunner.query(
      `UPDATE "menu_items" SET "label" = 'Phần mềm AI Agent' WHERE "label" = 'Phần mềm Xây kênh'`,
    );
  }
}
