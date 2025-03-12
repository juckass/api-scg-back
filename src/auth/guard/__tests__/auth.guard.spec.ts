import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '../auth.guard';
import { TokenBlacklistService } from '../../services/token-blacklist.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let tokenBlacklistService: jest.Mocked<TokenBlacklistService>;

  beforeEach(async () => {
    jwtService = {
      verifyAsync: jest.fn(),
    } as any;

    configService = {
      get: jest.fn(),
    } as any;

    tokenBlacklistService = {
      add: jest.fn(),
      has: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: TokenBlacklistService,
          useValue: tokenBlacklistService,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockExecutionContext: ExecutionContext;
    const mockRequest = {
      headers: {
        authorization: '',
      },
    };

    beforeEach(() => {
      mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as any;

      configService.get.mockReturnValue('test-secret');
    });

    it('should allow access with valid token', async () => {
      const mockPayload = {
        sub: '123',
        email: 'test@example.com',
        role: 'USER',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockRequest.headers.authorization = 'Bearer valid-token';
      jwtService.verifyAsync.mockResolvedValue(mockPayload);
      tokenBlacklistService.has.mockReturnValue(false);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockRequest['user']).toEqual(mockPayload);
    });

    it('should throw UnauthorizedException when no token provided', async () => {
      mockRequest.headers.authorization = undefined;

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      mockRequest.headers.authorization = 'Bearer invalid-token';
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token has expired', async () => {
      const expiredPayload = {
        sub: '123',
        email: 'test@example.com',
        role: 'USER',
        iat: Math.floor(Date.now() / 1000) - 7200,
        exp: Math.floor(Date.now() / 1000) - 3600,
      };

      mockRequest.headers.authorization = 'Bearer expired-token';
      jwtService.verifyAsync.mockResolvedValue(expiredPayload);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Token has expired',
      );
    });

    it('should throw UnauthorizedException when token is blacklisted', async () => {
      mockRequest.headers.authorization = 'Bearer blacklisted-token';
      tokenBlacklistService.has.mockReturnValue(true);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Token has been invalidated',
      );
    });
  });
});