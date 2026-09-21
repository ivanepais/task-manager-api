import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1789929450222 implements MigrationInterface {
    name = 'InitialSchema1789929450222'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(100) NOT NULL, "description" text, "completed" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "user_id" uuid NOT NULL, CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_afe2dcb24f4f3aa1290ae5a900" ON "tasks"  ("user_id", "completed") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "password" character varying NOT NULL, "user_name" character varying(100) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "roles" text array NOT NULL DEFAULT '{user}', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "color" character varying(7) NOT NULL DEFAULT '#4A90E2', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, CONSTRAINT "UQ_48f0690983e955b500b4a3e0293" UNIQUE ("name", "user_id"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2296b7fe012d95646fa41921c8" ON "categories"  ("user_id") `);
        await queryRunner.query(`CREATE TABLE "task_categories" ("task_id" uuid NOT NULL, "category_id" uuid NOT NULL, CONSTRAINT "PK_6102b120e4b7cace4607e857094" PRIMARY KEY ("task_id", "category_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3d8679aec1b4057bb0109cc587" ON "task_categories"  ("task_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_c980a208989aa8de8a88092b4c" ON "task_categories"  ("category_id") `);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_db55af84c226af9dce09487b61b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_2296b7fe012d95646fa41921c8b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_categories" ADD CONSTRAINT "FK_3d8679aec1b4057bb0109cc5873" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "task_categories" ADD CONSTRAINT "FK_c980a208989aa8de8a88092b4c1" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_categories" DROP CONSTRAINT "FK_c980a208989aa8de8a88092b4c1"`);
        await queryRunner.query(`ALTER TABLE "task_categories" DROP CONSTRAINT "FK_3d8679aec1b4057bb0109cc5873"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_2296b7fe012d95646fa41921c8b"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_db55af84c226af9dce09487b61b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c980a208989aa8de8a88092b4c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3d8679aec1b4057bb0109cc587"`);
        await queryRunner.query(`DROP TABLE "task_categories"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2296b7fe012d95646fa41921c8"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_afe2dcb24f4f3aa1290ae5a900"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
    }

}
