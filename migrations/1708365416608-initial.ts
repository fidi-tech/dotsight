import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1708365416608 implements MigrationInterface {
  name = 'Initial1708365416608';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "widget" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "category" text NOT NULL, "view" character varying, "viewParameters" json, "subcategories" text array NOT NULL DEFAULT '{}', "metrics" text array, "preset" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "isPublic" boolean NOT NULL DEFAULT false, "createdById" uuid NOT NULL, CONSTRAINT "PK_feb5fda4f8d30bbe0022f4ca804" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "credential" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "issuer" character varying NOT NULL, "subject_id" character varying NOT NULL, "user_id" uuid, CONSTRAINT "UQ_96f741a52e5e7dbe016cc75af19" UNIQUE ("issuer", "subject_id"), CONSTRAINT "PK_3a5169bcd3d5463cefeec78be82" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "widget" ADD CONSTRAINT "FK_7c204862b4d9a934544c1f937eb" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "credential" ADD CONSTRAINT "FK_f462968b424cfa19b629109b6f3" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "credential" DROP CONSTRAINT "FK_f462968b424cfa19b629109b6f3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "widget" DROP CONSTRAINT "FK_7c204862b4d9a934544c1f937eb"`,
    );
    await queryRunner.query(`DROP TABLE "credential"`);
    await queryRunner.query(`DROP TABLE "widget"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
