import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config(); // Carga las variables del archivo .env

  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors({
    origin: '*', // Permite todas las solicitudes de orígenes diferentes
    methods: 'GET,POST,PUT,DELETE', // Métodos HTTP permitidos
    allowedHeaders: 'Content-Type, Authorization', // Encabezados permitidos
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
