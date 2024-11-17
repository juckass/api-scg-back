import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileService {
  private readonly logDirectory: string;

  constructor() {
    this.logDirectory = process.env.LOG_DIRECTORY || 'logs';  // Puedes tenerlo configurable
    this.ensureLogDirectoryExists();
  }

  // Verifica que el directorio de logs exista, si no lo crea
  private ensureLogDirectoryExists() {
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory, { recursive: true });
    }
  }

  // Genera el nombre de archivo con la fecha actual para logs diarios
  getDailyFileName(prefix: string): string {
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    return `${prefix}-${formattedDate}.log`;  // Ejemplo: log-2024-11-16.log
  }

  // Escribe un mensaje de log en el archivo
  writeToFile(fileName: string, message: string) {
    const filePath = path.join(this.logDirectory, fileName);
    const logMessage = `[${new Date().toISOString()}] ${message}\n`;

    // Escribe al final del archivo, creando el archivo si no existe
    fs.appendFileSync(filePath, logMessage, { encoding: 'utf8' });
  }
}
