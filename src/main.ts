/* eslint-disable @typescript-eslint/no-unsafe-call */
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { MongoExceptionFilter } from './filters/mongo-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new MongoExceptionFilter());

  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT') || 3000;

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://digplus.africa',
      'https://digiplus-alliance-client.vercel.app',
      'http:127.0.0.1:5500',
    ],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('DigiPlus Alliance')
    .setDescription('Digital Innovation Hub.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(port);

  console.log(`Application is running on port: ${port}`);
}

bootstrap();
