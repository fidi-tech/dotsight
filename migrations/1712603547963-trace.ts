import { MigrationInterface, QueryRunner } from 'typeorm';

export class Trace1712603547963 implements MigrationInterface {
  name = 'Trace1712603547963';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "trace_piece" ("id" SERIAL NOT NULL, "dataSourceId" text NOT NULL, "latencyMs" integer NOT NULL, "error" boolean NOT NULL, "traceId" uuid, CONSTRAINT "PK_5de8bfd18bea2dcb5446db6ad01" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "trace" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subcategories" text array NOT NULL DEFAULT '{}', "metrics" text array, "preset" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d55e3146ed1a9769069a83a8044" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "widget" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "widget" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "trace_piece" ADD CONSTRAINT "FK_a8a5d9910308d119a4f64557acd" FOREIGN KEY ("traceId") REFERENCES "trace"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "trace_piece" DROP CONSTRAINT "FK_a8a5d9910308d119a4f64557acd"`,
    );
    await queryRunner.query(`ALTER TABLE "widget" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "widget" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`DROP TABLE "trace"`);
    await queryRunner.query(`DROP TABLE "trace_piece"`);
  }
}
