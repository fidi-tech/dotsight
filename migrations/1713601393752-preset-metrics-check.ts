import { MigrationInterface, QueryRunner } from 'typeorm';

export class PresetMetricsCheck1713601393752 implements MigrationInterface {
  name = 'PresetMetricsCheck1713601393752';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "widget" ADD CONSTRAINT "CHK_81efc749eb01a1e9d65d36a405" CHECK ("preset" IS NULL OR "metrics" IS NULL)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "widget" DROP CONSTRAINT "CHK_81efc749eb01a1e9d65d36a405"`,
    );
  }
}
