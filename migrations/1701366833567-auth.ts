import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auth1701366833567 implements MigrationInterface {
  name = 'Auth1701366833567';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "credential" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "issuer" character varying NOT NULL, "subject_id" character varying NOT NULL, "user_id" uuid, CONSTRAINT "UQ_96f741a52e5e7dbe016cc75af19" UNIQUE ("issuer", "subject_id"), CONSTRAINT "PK_3a5169bcd3d5463cefeec78be82" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "pipeline" ADD "createdById" uuid`);
    await queryRunner.query(
      `ALTER TABLE "pipeline" ADD CONSTRAINT "FK_eb6346819381efb488f95624872" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
      `ALTER TABLE "pipeline" DROP CONSTRAINT "FK_eb6346819381efb488f95624872"`,
    );
    await queryRunner.query(`ALTER TABLE "pipeline" DROP COLUMN "createdById"`);
    await queryRunner.query(`DROP TABLE "credential"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
