import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateArticle1761810477056 implements MigrationInterface {
  name = 'UpdateArticle1761810477056';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "article" ADD "userFavoriteIds" text NOT NULL DEFAULT '[]'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "article" DROP COLUMN "userFavoriteIds"`,
    );
  }
}
