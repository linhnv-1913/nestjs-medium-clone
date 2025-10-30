import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesModule } from './articles/articles.module';
import { dataSourceOptions } from './database';
import { AuthModule } from './auth/auth.module';
import { I18nModule } from 'nestjs-i18n';
import { i18nConfig } from './i18n/i18n-config';
import { CommentsModule } from './article-comments/comments.module';
import { ProfilesModule } from './profiles/profiles.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ArticlesModule,
    CommentsModule,
    ProfilesModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(dataSourceOptions),
    I18nModule.forRoot(i18nConfig),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
