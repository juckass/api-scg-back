import { HttpException, ArgumentsHost, InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpExceptionFilter } from './http-exception.filter';
import { LoggerService } from '../global/services/logger.service';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let loggerService: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HttpExceptionFilter,
        {
          provide: LoggerService,
          useValue: {
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    filter = module.get<HttpExceptionFilter>(HttpExceptionFilter);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should log the error and send the response for HttpException', () => {
    const mockException = new HttpException('Test error', 400);
    const mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue({
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        }),
        getRequest: jest.fn().mockReturnValue({
          url: '/test-url',
        }),
      }),
    } as unknown as ArgumentsHost;

    filter.catch(mockException, mockArgumentsHost);

    expect(loggerService.error).toHaveBeenCalledWith(
      'HTTP Error: Test error',
      mockException.stack,
    );

    const response = mockArgumentsHost.switchToHttp().getResponse();
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 400,
      timestamp: expect.any(String),
      path: '/test-url',
      message: 'Test error',
    });
  });

  it('should log the error and send the response for InternalServerErrorException', () => {
    const mockException = new InternalServerErrorException('Internal server error');
    const mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue({
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        }),
        getRequest: jest.fn().mockReturnValue({
          url: '/test-url',
        }),
      }),
    } as unknown as ArgumentsHost;

    filter.catch(mockException, mockArgumentsHost);

    expect(loggerService.error).toHaveBeenCalledWith(
      'HTTP Error: Internal server error',
      mockException.stack,
    );

    const response = mockArgumentsHost.switchToHttp().getResponse();
    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 500,
      timestamp: expect.any(String),
      path: '/test-url',
      message: 'Internal server error',
    });
  });

  it('should handle exceptions without a message', () => {
    const mockException = new HttpException('', 400);
    const mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue({
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        }),
        getRequest: jest.fn().mockReturnValue({
          url: '/test-url',
        }),
      }),
    } as unknown as ArgumentsHost;

    filter.catch(mockException, mockArgumentsHost);

    expect(loggerService.error).toHaveBeenCalledWith(
      'HTTP Error: ',
      mockException.stack,
    );

    const response = mockArgumentsHost.switchToHttp().getResponse();
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 400,
      timestamp: expect.any(String),
      path: '/test-url',
      message: 'Internal server error',
    });
  });
});