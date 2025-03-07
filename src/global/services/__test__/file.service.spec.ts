import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from '../file.service';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');

describe('FileService', () => {
  let service: FileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileService],
    }).compile();

    service = module.get<FileService>(FileService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should ensure log directory exists', () => {
    const mkdirSyncSpy = jest.spyOn(fs, 'mkdirSync');
    const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(false);

    service['ensureLogDirectoryExists']();

    expect(existsSyncSpy).toHaveBeenCalledWith(service['logDirectory']);
    expect(mkdirSyncSpy).toHaveBeenCalledWith(service['logDirectory'], { recursive: true });
  });

  

  it('should generate daily file name', () => {
    const prefix = 'log';
    const date = new Date(2025, 2, 7); // 7 de marzo de 2025
    jest.spyOn(global, 'Date').mockImplementation(() => date);

    const fileName = service.getDailyFileName(prefix);

    expect(fileName).toBe('log-2025-03-07.log');
  });

  it('should write log message to file', () => {
    const fileName = 'log-2025-03-07.log';
    const message = 'Test log message';
    const appendFileSyncSpy = jest.spyOn(fs, 'appendFileSync');

    service.writeToFile(fileName, message);

    const filePath = path.join(service['logDirectory'], fileName);
    const logMessage = `[${new Date().toISOString()}] ${message}\n`;

    expect(appendFileSyncSpy).toHaveBeenCalledWith(filePath, logMessage, { encoding: 'utf8' });
  });
});