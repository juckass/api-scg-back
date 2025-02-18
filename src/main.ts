import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


async function bootstrap() {
  dotenv.config(); // Carga las variables del archivo .env

  const app = await NestFactory.create(AppModule);


  // Configurar ValidationPipe globalmente
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    exceptionFactory: (errors) => {
      const errorMessages = errors.map(
        error => `${error.property} has wrong value ${error.value}, ${Object.values(error.constraints).join(', ')}`
      );
      return new BadRequestException(errorMessages);
    },
  }));




  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Documentation')
    .setDescription('The api for the NestJS SCG project')
    .setVersion('1.0')
    .addTag('users')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, documentFactory);

  // Habilitar CORS
  app.enableCors({
    origin: '*', // Permite todas las solicitudes de orígenes diferentes
    methods: 'GET,POST,PUT,DELETE', // Métodos HTTP permitidos
    allowedHeaders: 'Content-Type, Authorization', // Encabezados permitidos
  });


  
  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
