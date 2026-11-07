import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import { NestExpressApplication } from '@nestjs/platform-express';
import express from 'express';

const server = express();

export async function createNestServer(expressInstance: express.Express) {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressInstance),
  );

  // 1. السماح الشامل للفرونت إند من أي منفذ
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // 2. تفعيل الفلترة
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
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

  await app.init();
  return app;
}

// تشغيل محلي إذا لم يتم تشغيله على Vercel
if (process.env.NODE_ENV !== 'production') {
  createNestServer(server).then(async (app) => {
    await app.listen(3000);
    console.log('Server is running on http://localhost:3000');
  });
}

export default server;