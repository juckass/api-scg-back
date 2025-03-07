import { Test, TestingModule } from '@nestjs/testing';
import { GlobalModule } from './global.module';
import { LoggerService } from './services/logger.service';
import { FileService } from './services/file.service';
import { PaginationService } from './services/pagination.service';


describe('GlobalModule', () => {
  let loggerService: LoggerService;
  let fileService: FileService;
  let paginationService: PaginationService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [GlobalModule],
    }).compile();

    loggerService = module.get<LoggerService>(LoggerService);
    fileService = module.get<FileService>(FileService);
    paginationService = module.get<PaginationService>(PaginationService);
  });

  it('should provide LoggerService', () => {
    expect(loggerService).toBeDefined();
  });

  it('should provide FileService', () => {
    expect(fileService).toBeDefined();
  });

  it('should provide PaginationService', () => {
    expect(paginationService).toBeDefined();
  });

});