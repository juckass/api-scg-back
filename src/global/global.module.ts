import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerService } from './services/logger.service';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { FileService } from './services/file.service'; // Importar el FileService
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PaginationService } from './services/pagination.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que las variables de entorno estén disponibles globalmente
    })
  ],
  providers: [
    LoggerService,
    FileService, // Agregar FileService a los proveedores
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    PaginationService,
  ],
  exports: [LoggerService, FileService, PaginationService], // Exponer el FileService si lo necesitas fuera del módulo
})
export class GlobalModule {}
