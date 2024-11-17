import { Injectable } from '@nestjs/common';
import { LoggerService } from './global/services/logger.service';

@Injectable()
export class AppService {
  constructor(private readonly logger: LoggerService) {}

  getHello(): string {
    this.logger.error('Fetching hello message');
    return 'Hello World!';
  }
}
