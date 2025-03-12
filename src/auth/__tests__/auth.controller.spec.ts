import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../services/auth.service';
import { TokenBlacklistService } from '../services/token-blacklist.service';
import { SignInUserDto } from '../dto/sign-in-user.dto';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let tokenBlacklistService: jest.Mocked<TokenBlacklistService>;

  beforeEach(async () => {
    // Mock de los servicios
    authService = {
      signIn: jest.fn(),
    } as any;

    tokenBlacklistService = {
      add: jest.fn(),
      has: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: TokenBlacklistService,
          useValue: tokenBlacklistService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('signIn', () => {
    const mockSignInDto: SignInUserDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return access token when login is successful', async () => {
      // Arrange
      const expectedResult = { access_token: 'test-token' };
      authService.signIn.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.signIn(mockSignInDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(authService.signIn).toHaveBeenCalledWith(mockSignInDto);
    });

    it('should throw UnauthorizedException when login fails', async () => {
      // Arrange
      authService.signIn.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      // Act & Assert
      await expect(controller.signIn(mockSignInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should successfully logout and add token to blacklist', async () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'Bearer test-token',
        },
      };

      // Act
      const result = await controller.logout(mockRequest as any);

      // Assert
      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(tokenBlacklistService.add).toHaveBeenCalledWith('test-token');
    });

    it('should handle logout without token', async () => {
      // Arrange
      const mockRequest = {
        headers: {},
      };

      // Act
      const result = await controller.logout(mockRequest as any);

      // Assert
      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(tokenBlacklistService.add).not.toHaveBeenCalled();
    });

    it('should handle logout with malformed authorization header', async () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'malformed-token',
        },
      };

      // Act
      const result = await controller.logout(mockRequest as any);

      // Assert
      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(tokenBlacklistService.add).not.toHaveBeenCalled();
    });
  });
});
