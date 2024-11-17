import { Injectable, Logger, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileService } from './file.service';

@Injectable()
export class LoggerService {
  private readonly logger = new Logger(LoggerService.name);
  private readonly loggingEnabled: boolean;
  private readonly errorLoggingEnabled: boolean;
  private readonly logLevel: LogLevel[];
  private readonly fileLoggingEnabled: boolean;
  private readonly logToFileOnlyErrors: boolean;

  constructor(
    private configService: ConfigService,
    private fileService: FileService,
  ) {
    // Leer las configuraciones desde el archivo .env
    this.loggingEnabled = this.configService.get<boolean>(
      'LOGGING_ENABLED',
      true,
    );
    this.errorLoggingEnabled = this.configService.get<boolean>(
      'ERROR_LOGGING_ENABLED',
      true,
    );
    this.logLevel = (
      this.configService.get<string>('LOG_LEVEL', 'log,debug,warn,error') ||
      'log,debug,warn,error'
    ).split(',') as LogLevel[];
    this.fileLoggingEnabled = this.configService.get<boolean>(
      'FILE_LOGGING_ENABLED',
      true,
    );
    this.logToFileOnlyErrors =
      this.configService
        .get<string>('LOG_TO_FILE_ONLY_ERRORS', 'false')
        .toLowerCase() === 'true';
  }

  log(message: string) {
    if (this.loggingEnabled && this.logLevel.includes('log')) {
      this.logger.log(`LOG: ${message}`);
      if (!this.logToFileOnlyErrors) {
        this.writeToFile('log', message); // Escribir solo si no es "solo errores"
      } else {
        this.logger.log(
          'Not writing to file, LOG_TO_FILE_ONLY_ERRORS is enabled.',
        );
      }
    }
  }

  debug(message: string) {
    if (this.loggingEnabled && this.logLevel.includes('debug')) {
      this.logger.debug(`DEBUG: ${message}`);
      if (!this.logToFileOnlyErrors) {
        this.writeToFile('debug', message); // Escribir solo si no es "solo errores"
      } else {
        this.logger.log(
          'Not writing to file, LOG_TO_FILE_ONLY_ERRORS is enabled.',
        );
      }
    }
  }

  warn(message: string) {
    if (this.loggingEnabled && this.logLevel.includes('warn')) {
      this.logger.warn(`WARN: ${message}`);
      if (!this.logToFileOnlyErrors) {
        this.writeToFile('warn', message); // Escribir solo si no es "solo errores"
      } else {
        this.logger.log(
          'Not writing to file, LOG_TO_FILE_ONLY_ERRORS is enabled.',
        );
      }
    }
  }

  error(message: string, trace?: string) {
    if (this.errorLoggingEnabled && this.logLevel.includes('error')) {
      this.logger.error(`ERROR: ${message} - Trace: ${trace || ''}`);
      this.writeToFile('error', `${message} - Trace: ${trace || ''}`); // Los errores siempre se escriben en el archivo
    }
  }

  private writeToFile(level: string, message: string) {
    if (!this.fileLoggingEnabled) return; // Si la escritura de archivos no está habilitada, no hacer nada
    const logMessage = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}\n`;
    const fileName = this.fileService.getDailyFileName(level); // Obtener nombre de archivo con fecha
    this.fileService.writeToFile(fileName, logMessage); // Escribir el log en el archivo
  }
}
