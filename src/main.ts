import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as session from 'express-session';
import { ConfigService } from '@nestjs/config';
import { config as dotEnvConfig } from 'dotenv';
import * as cookieParser from 'cookie-parser';

dotEnvConfig();

const applicationConfig = new ConfigService();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.use(cookieParser());
  app.use(
    session({
      secret: applicationConfig.get<string>('SESSION_SECRET'),
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.setGlobalPrefix('/api');

  const config = new DocumentBuilder()
    .setTitle('DotSight')
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(3000);
}
bootstrap();
