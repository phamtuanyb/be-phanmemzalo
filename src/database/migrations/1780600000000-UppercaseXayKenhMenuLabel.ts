import { MigrationInterface, QueryRunner } from 'typeorm';

export class UppercaseXayKenhMenuLabel1780600000000 implements MigrationInterface {
  name = 'UppercaseXayKenhMenuLabel1780600000000';

  // Đổi nhãn nav menu "Phần mềm Xây kênh" / "Phần mềm AI Agent" → "PHẦN MỀM XÂY KÊNH".
  // KHÔNG đổi url — giữ nguyên đường dẫn hiện tại.
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "menu_items" SET "label" = 'PHẦN MỀM XÂY KÊNH' WHERE "label" IN ('Phần mềm Xây kênh', 'Phần mềm AI Agent')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "menu_items" SET "label" = 'Phần mềm Xây kênh' WHERE "label" = 'PHẦN MỀM XÂY KÊNH'`,
    );
  }
}
