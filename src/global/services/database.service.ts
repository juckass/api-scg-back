import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import * as path from 'path';

@Injectable()
export class DatabaseService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql', // O 'postgres' dependiendo de tu base de datos
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 3306),
      username: this.configService.get<string>('DB_USERNAME', 'root'),
      password: this.configService.get<string>('DB_PASSWORD', ''),
      database: this.configService.get<string>('DB_DATABASE', 'test'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'], // Dirección de tus entidades
      migrations: [
        path.join(__dirname, '../**/migrations/*{.ts,.js}'), // Detecta todas las migraciones en todos los módulos
      ],
      synchronize: false, // No sincronizar automáticamente en producción
      migrationsRun: true, // Ejecuta migraciones automáticamente
    };
  }
}
