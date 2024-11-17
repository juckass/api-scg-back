import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerService } from './services/logger.service';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { FileService } from './services/file.service'; // Importar el FileService
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [ConfigModule],
  providers: [
    LoggerService,
    FileService,  // Agregar FileService a los proveedores
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [LoggerService, FileService], // Exponer el FileService si lo necesitas fuera del módulo
})
export class GlobalModule {}
