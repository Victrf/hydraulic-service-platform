import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ FIX: Serve uploads from correct root folder
  app.use('/uploads', express.static(join(process.cwd(), 'src/uploads')));

  // ✅ GLOBAL VALIDATION
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ SWAGGER SETUP
  const config = new DocumentBuilder()
    .setTitle('Hydraulic Service API')
    .setDescription('API for equipment maintenance and technician dispatch')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // ✅ START SERVER
  await app.listen(3000);

  console.log('🚀 API running on http://localhost:3000');
  console.log('📂 Static uploads served from /uploads');
}

void bootstrap();
