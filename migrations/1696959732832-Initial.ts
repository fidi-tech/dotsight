import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1696959732832 implements MigrationInterface {
    name = 'Initial1696959732832'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "data_source" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying NOT NULL, "config" json NOT NULL, "pipeline_id" uuid, CONSTRAINT "PK_9775f6b6312a926ed37d3af7d95" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mixer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entity" character varying NOT NULL, "config" json NOT NULL, "pipeline_id" uuid, CONSTRAINT "PK_ef02f9c669745e0e1bed69c669d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "middleware" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying NOT NULL, "config" json NOT NULL, "order" integer NOT NULL, "pipeline_id" uuid, CONSTRAINT "UQ_6f7f1215920e90d902599934876" UNIQUE ("pipeline_id", "order"), CONSTRAINT "PK_aced9b1bc194d77dd07ddd4d092" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mapper" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "type" character varying NOT NULL, "config" json NOT NULL, "pipeline_id" uuid, CONSTRAINT "UQ_e83bb4f6291dd30d674498bc8c2" UNIQUE ("code", "pipeline_id"), CONSTRAINT "PK_224ac6bde7daf61000eee9d3370" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "widget" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying NOT NULL, "config" json NOT NULL, "datashape" character varying NOT NULL, "mapper_id" uuid, "pipeline_id" uuid, CONSTRAINT "REL_521e04535f924325322571b81f" UNIQUE ("mapper_id"), CONSTRAINT "PK_feb5fda4f8d30bbe0022f4ca804" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pipeline" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_df8aedd50509192d995535d68cd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "data_source" ADD CONSTRAINT "FK_a443e2998350efc1e45a8625ada" FOREIGN KEY ("pipeline_id") REFERENCES "pipeline"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mixer" ADD CONSTRAINT "FK_6914071fbba1ee4767f12918890" FOREIGN KEY ("pipeline_id") REFERENCES "pipeline"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "middleware" ADD CONSTRAINT "FK_2f23aa1eb2e6b7ebbde0c56bf9c" FOREIGN KEY ("pipeline_id") REFERENCES "pipeline"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mapper" ADD CONSTRAINT "FK_4a18b5f49958259c953fbe3c012" FOREIGN KEY ("pipeline_id") REFERENCES "pipeline"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "widget" ADD CONSTRAINT "FK_521e04535f924325322571b81f3" FOREIGN KEY ("mapper_id") REFERENCES "mapper"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "widget" ADD CONSTRAINT "FK_93ee0c96034136a3183bb30bf28" FOREIGN KEY ("pipeline_id") REFERENCES "pipeline"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "widget" DROP CONSTRAINT "FK_93ee0c96034136a3183bb30bf28"`);
        await queryRunner.query(`ALTER TABLE "widget" DROP CONSTRAINT "FK_521e04535f924325322571b81f3"`);
        await queryRunner.query(`ALTER TABLE "mapper" DROP CONSTRAINT "FK_4a18b5f49958259c953fbe3c012"`);
        await queryRunner.query(`ALTER TABLE "middleware" DROP CONSTRAINT "FK_2f23aa1eb2e6b7ebbde0c56bf9c"`);
        await queryRunner.query(`ALTER TABLE "mixer" DROP CONSTRAINT "FK_6914071fbba1ee4767f12918890"`);
        await queryRunner.query(`ALTER TABLE "data_source" DROP CONSTRAINT "FK_a443e2998350efc1e45a8625ada"`);
        await queryRunner.query(`DROP TABLE "pipeline"`);
        await queryRunner.query(`DROP TABLE "widget"`);
        await queryRunner.query(`DROP TABLE "mapper"`);
        await queryRunner.query(`DROP TABLE "middleware"`);
        await queryRunner.query(`DROP TABLE "mixer"`);
        await queryRunner.query(`DROP TABLE "data_source"`);
    }

}
