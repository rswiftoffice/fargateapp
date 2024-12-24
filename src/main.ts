import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DatabaseService } from './core/database/database.service';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  /* Enabling Global Validation  */
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  /* Serve static files */

  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  app.enableCors();
  /* Swagger */
  const config = new DocumentBuilder()
    .setTitle('RSAF Transport')
    .setDescription('API documentation for RSAF Transport application.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  /* Prisma */
  const prismaService: DatabaseService = app.get(DatabaseService);
  prismaService.enableShutdownHooks(app);

  /* Cookies */
  app.use(cookieParser());

  const port = process.env.PORT || 8001;

  await app.listen(port);
}
bootstrap();
