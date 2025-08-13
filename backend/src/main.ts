// src/main.ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ CORS (ajusta origins según necesites)
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // ✅ Validación global (UNA sola vez)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,              // elimina props extra
    forbidNonWhitelisted: true,   // lanza 400 si vienen props no permitidas
    transform: true,              // convierte payloads al tipo del DTO
    transformOptions: {
      enableImplicitConversion: true, // convierte strings a number/boolean si el DTO lo pide
    },
  }));

  await app.listen(3001);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

}
bootstrap();