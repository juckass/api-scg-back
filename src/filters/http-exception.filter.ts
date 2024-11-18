// src/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response, Request } from 'express';
import { HttpException } from '@nestjs/common';
import { LoggerService } from '../global/services/logger.service'; // Asegúrate de la ruta correcta

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly loggerService: LoggerService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Registrar el error usando LoggerService
    this.loggerService.error(
      `HTTP Error: ${exception.message}`,
      exception.stack, // Trace del error
    );

    // Construir la respuesta de error
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message || 'Internal server error',
    };

    response.status(status).json(errorResponse);
  }
}
