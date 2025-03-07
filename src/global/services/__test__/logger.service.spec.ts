import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../logger.service';
import { ConfigService } from '@nestjs/config';
import { FileService } from '../file.service';
import { Logger } from '@nestjs/common';

describe('LoggerService', () => {
  let service: LoggerService;
  let mockLogger: jest.Mocked<Logger>;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockFileService: jest.Mocked<FileService>;

  beforeEach(async () => {
    // Create a mock Logger instance
    mockLogger = {
      log: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      setContext: jest.fn(),
    } as any;

    // Create mock ConfigService with default values
    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        const config = {
          LOGGING_ENABLED: true,
          ERROR_LOGGING_ENABLED: true,
          LOG_LEVEL: 'log,debug,warn,error',
          FILE_LOGGING_ENABLED: true,
          LOG_TO_FILE_ONLY_ERRORS: 'false',
        };
        return config[key];
      }),
    } as any;

    // Create mock FileService
    mockFileService = {
      getDailyFileName: jest.fn().mockReturnValue('test.log'),
      writeToFile: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: Logger,
          useValue: mockLogger,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: FileService,
          useValue: mockFileService,
        },
      ],
    }).compile();

    // Reset service instance for each test
    service = new LoggerService(mockConfigService, mockFileService);
    (service as any).logger = mockLogger;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('log method', () => {
    it('should log message when logging is enabled', () => {
      const message = 'test message';
      service.log(message);
      expect(mockLogger.log).toHaveBeenCalledWith(`LOG: ${message}`);
      expect(mockFileService.writeToFile).toHaveBeenCalled();
    });

    it('should not log message when logging is disabled', () => {
      // Setup mock before creating service instance
      mockConfigService.get.mockImplementation((key: string) => {
        const config = {
          LOGGING_ENABLED: false,
          ERROR_LOGGING_ENABLED: true,
          LOG_LEVEL: 'log,debug,warn,error',
          FILE_LOGGING_ENABLED: true,
          LOG_TO_FILE_ONLY_ERRORS: 'false',
        };
        return config[key];
      });

      // Create new service instance with updated config
      service = new LoggerService(mockConfigService, mockFileService);
      (service as any).logger = mockLogger;

      service.log('test message');
      expect(mockLogger.log).not.toHaveBeenCalled();
      expect(mockFileService.writeToFile).not.toHaveBeenCalled();
    });
  });

  describe('debug method', () => {
    it('should debug message when debugging is enabled', () => {
      const message = 'test debug message';
      service.debug(message);
      expect(mockLogger.debug).toHaveBeenCalledWith(`DEBUG: ${message}`);
      expect(mockFileService.writeToFile).toHaveBeenCalled();
    });

    it('should not write to file when LOG_TO_FILE_ONLY_ERRORS is enabled', () => {
      // Setup mock before creating service instance
      mockConfigService.get.mockImplementation((key: string) => {
        const config = {
          LOGGING_ENABLED: true,
          ERROR_LOGGING_ENABLED: true,
          LOG_LEVEL: 'log,debug,warn,error',
          FILE_LOGGING_ENABLED: true,
          LOG_TO_FILE_ONLY_ERRORS: 'true',
        };
        return config[key];
      });

      // Create new service instance with updated config
      service = new LoggerService(mockConfigService, mockFileService);
      (service as any).logger = mockLogger;

      service.debug('test message');
      expect(mockFileService.writeToFile).not.toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Not writing to file, LOG_TO_FILE_ONLY_ERRORS is enabled.',
      );
    });
  });

  describe('warn method', () => {
    it('should warn message when warning is enabled', () => {
      const message = 'test warning message';
      service.warn(message);
      expect(mockLogger.warn).toHaveBeenCalledWith(`WARN: ${message}`);
      expect(mockFileService.writeToFile).toHaveBeenCalled();
    });

    it('should not write to file when LOG_TO_FILE_ONLY_ERRORS is enabled', () => {
      // Setup mock before creating service instance
      mockConfigService.get.mockImplementation((key: string) => {
        const config = {
          LOGGING_ENABLED: true,
          ERROR_LOGGING_ENABLED: true,
          LOG_LEVEL: 'log,debug,warn,error',
          FILE_LOGGING_ENABLED: true,
          LOG_TO_FILE_ONLY_ERRORS: 'true',
        };
        return config[key];
      });

      // Create new service instance with updated config
      service = new LoggerService(mockConfigService, mockFileService);
      (service as any).logger = mockLogger;

      service.warn('test message');
      expect(mockFileService.writeToFile).not.toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Not writing to file, LOG_TO_FILE_ONLY_ERRORS is enabled.',
      );
    });
  });

  describe('error method', () => {
    it('should error message with trace when error logging is enabled', () => {
      const message = 'test error message';
      const trace = 'error trace';
      service.error(message, trace);
      expect(mockLogger.error).toHaveBeenCalledWith(`ERROR: ${message} - Trace: ${trace}`);
      expect(mockFileService.writeToFile).toHaveBeenCalled();
    });

    it('should error message without trace when trace is not provided', () => {
      const message = 'test error message';
      service.error(message);
      expect(mockLogger.error).toHaveBeenCalledWith(`ERROR: ${message} - Trace: `);
      expect(mockFileService.writeToFile).toHaveBeenCalled();
    });

    it('should not log error when error logging is disabled', () => {
      // Setup mock before creating service instance
      mockConfigService.get.mockImplementation((key: string) => {
        const config = {
          LOGGING_ENABLED: true,
          ERROR_LOGGING_ENABLED: false,
          LOG_LEVEL: 'log,debug,warn,error',
          FILE_LOGGING_ENABLED: true,
          LOG_TO_FILE_ONLY_ERRORS: 'false',
        };
        return config[key];
      });

      // Create new service instance with updated config
      service = new LoggerService(mockConfigService, mockFileService);
      (service as any).logger = mockLogger;

      service.error('test message');
      expect(mockLogger.error).not.toHaveBeenCalled();
      expect(mockFileService.writeToFile).not.toHaveBeenCalled();
    });
  });
});