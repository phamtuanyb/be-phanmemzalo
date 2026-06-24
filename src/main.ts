import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AppDataSource } from './database/data-source';

async function runMigrations() {
  try {
    await AppDataSource.initialize();
    const pending = await AppDataSource.showMigrations();
    if (pending) {
      console.log('⏳ Đang chạy migrations...');
      await AppDataSource.runMigrations();
      console.log('✅ Migrations hoàn tất');
    } else {
      console.log('✅ Database đã cập nhật, không có migration mới');
    }
    await AppDataSource.destroy();
  } catch (err) {
    console.error('❌ Migration thất bại:', err);
    process.exit(1);
  }
}

async function bootstrap() {
  if (process.env.NODE_ENV === 'production') {
    await runMigrations();
  }
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Tăng giới hạn body để chứa HTML có ảnh
  app.useBodyParser('json', { limit: '50mb' });
  app.useBodyParser('urlencoded', { limit: '50mb', extended: true });
  const config = app.get(ConfigService);

  // CORS
  const origins = config.get<string>('CORS_ORIGINS', 'http://localhost:3000');
  app.enableCors({
    origin: origins.split(',').map((o) => o.trim()),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global response transform
  app.useGlobalInterceptors(new TransformInterceptor());

  // Đảm bảo thư mục uploads tồn tại
  const uploadDir = config.get<string>('UPLOAD_DIR', './uploads');
  const absUploadDir = path.resolve(uploadDir);
  if (!fs.existsSync(absUploadDir)) {
    fs.mkdirSync(absUploadDir, { recursive: true });
  }

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('VSoftware API')
    .setDescription('API backend cho hệ thống tin tức')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Đăng nhập / xác thực')
    .addTag('Users', 'Quản lý tài khoản')
    .addTag('Categories', 'Quản lý danh mục')
    .addTag('Posts', 'Quản lý bài viết')
    .addTag('Media', 'Thư viện media')
    .addTag('Menus', 'Quản lý menu điều hướng')
    .addTag('Contact', 'Form liên hệ / yêu cầu tư vấn')
    .addTag('SEO', 'Chấm điểm SEO bài viết')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = config.get<number>('PORT', 3001);
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📖 Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();
