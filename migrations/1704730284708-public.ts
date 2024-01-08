import { MigrationInterface, QueryRunner } from 'typeorm';

export class Public1704730284708 implements MigrationInterface {
  name = 'Public1704730284708';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pipeline" ADD "isPublic" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pipeline" DROP COLUMN "isPublic"`);
  }
}
