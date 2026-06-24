import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContactSubmissionsTable1780000000000 implements MigrationInterface {
  name = 'AddContactSubmissionsTable1780000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "contact_submissions" (
        "id"          SERIAL PRIMARY KEY,
        "name"        character varying(255) NOT NULL,
        "phone"       character varying(20) NOT NULL,
        "email"       character varying,
        "company"     character varying(255),
        "need"        character varying NOT NULL,
        "description" text,
        "createdAt"   TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "contact_submissions"`);
  }
}
