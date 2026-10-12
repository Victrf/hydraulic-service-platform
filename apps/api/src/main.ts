import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

import * as express from 'express';
import { join } from 'path';
import { mkdirSync } from 'fs';

const uploadDirectories = [
  join(process.cwd(), 'src', 'uploads', 'users'),
  join(process.cwd(), 'src', 'uploads', 'products'),
  join(process.cwd(), 'src', 'uploads', 'companies'),
  join(process.cwd(), 'src', 'uploads', 'maintenance-findings'),
  join(process.cwd(), 'uploads', 'service-requests'),
];

async function bootstrap() {
  // Ensure upload directories exist before handling requests.
  for (const directory of uploadDirectories) {
    mkdirSync(directory, { recursive: true });
  }

  const app = await NestFactory.create(AppModule);

  // Serve images from apps/api/src/uploads/.
  app.use('/uploads', express.static(join(process.cwd(), 'src', 'uploads')));

  // Preserve existing images from apps/api/uploads/.
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // GLOBAL VALIDATION
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // SWAGGER SETUP
  const config = new DocumentBuilder()
    .setTitle('Hydraulic Service API')
    .setDescription('API for equipment maintenance and technician dispatch')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // START SERVER
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`API running on port ${port}`);
  console.log('Upload directories checked and created.');
}

void bootstrap();
