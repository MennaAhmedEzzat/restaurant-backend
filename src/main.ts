import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. السماح الشامل للفرونت إند من أي منفذ (3001 أو غيره) لتجنب أخطاء Preflight/CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // 2. تفعيل الفلترة مع إيقاف منع الحقول غير المعرفة لتجنب رفض طلب الاستبدال
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // تم تغييرها لـ false حتى لا يرفض الطلب عند التمرير
      transform: true,
    }),
  );

  // إعداد توثيق Swagger
  const config = new DocumentBuilder()
    .setTitle('B.Laban Loyalty API')
    .setDescription('The official loyalty, gamification, and rewards system API for B.Laban')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
bootstrap();