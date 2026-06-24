import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { Category } from './entities/category.entity';
import { ContactSubmission } from './entities/contact-submission.entity';
import { SiteSettings } from './entities/site-settings.entity';
import { Media } from './entities/media.entity';
import { Menu } from './entities/menu.entity';
import { MenuItem } from './entities/menu-item.entity';
import { Post } from './entities/post.entity';
import { User } from './entities/user.entity';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { MediaModule } from './modules/media/media.module';
import { ContactModule } from './modules/contact/contact.module';
import { SiteSettingsModule } from './modules/site-settings/site-settings.module';
import { MailModule } from './modules/mail/mail.module';
import { SeoModule } from './modules/seo/seo.module';
import { MenusModule } from './modules/menus/menus.module';
import { PostsModule } from './modules/posts/posts.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'postgres'),
        password: config.get('DB_PASSWORD', 'postgres'),
        database: config.get('DB_DATABASE', 'news_db'),
        entities: [User, Category, Post, Media, Menu, MenuItem, ContactSubmission, SiteSettings],
        synchronize: config.get('NODE_ENV') !== 'production',
        logging: config.get('NODE_ENV') === 'development',
        retryAttempts: 20,
        retryDelay: 3000,
        keepConnectionAlive: true,
        autoLoadEntities: false,
        extra: {
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        },
      }),
    }),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    AuthModule,
    UsersModule,
    CategoriesModule,
    PostsModule,
    MediaModule,
    MenusModule,
    MailModule,
    ContactModule,
    SiteSettingsModule,
    SeoModule,
  ],
})
export class AppModule {}
