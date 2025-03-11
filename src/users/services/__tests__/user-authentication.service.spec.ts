import { Test, TestingModule } from '@nestjs/testing';
import { UserAuthenticationService } from '../user-authentication.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { LoggerService } from '../../../global/services/logger.service';
import { User } from '@prisma/client';
import { Role } from '../../enums/role.enum';

describe('UserAuthenticationService', () => {
  let service: UserAuthenticationService;
  let prismaService: jest.Mocked<PrismaService>;
  let loggerService: jest.Mocked<LoggerService>;

  const mockUser: User = {
      id: 'test-id',
      email: 'test@example.com',
      password: 'hashedPassword',
      name: 'John',
      fechaRegistro: new Date(),
      deletedAt: null,
      rol: 'ADMIN'
  };

  beforeEach(async () => {
    // Create mocks
    prismaService = {
      user: {
        findUnique: jest.fn(),
      },
    } as any;

    loggerService = {
      error: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAuthenticationService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: LoggerService,
          useValue: loggerService,
        },
      ],
    }).compile();

    service = module.get<UserAuthenticationService>(UserAuthenticationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should find and return user without password', async () => {
      // Arrange
      const email = 'test@example.com';
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await service.findByEmail(email);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual({
        ...mockUser,
        password: undefined,
      });
    });

    it('should return error when user not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await service.findByEmail(email);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(loggerService.error).toHaveBeenCalledWith(
        `User with email ${email} not found`,
      );
      expect(result).toEqual({
        error: 'User not found',
      });
    });

    it('should handle database errors', async () => {
      // Arrange
      const email = 'test@example.com';
      const dbError = new Error('Database error');
      (prismaService.user.findUnique as jest.Mock).mockRejectedValue(dbError);

      // Act & Assert
      await expect(service.findByEmail(email)).rejects.toThrow(dbError);
    });
  });

  describe('removePassword', () => {
    it('should remove password from user object', () => {
      // Arrange
      const userWithPassword = { ...mockUser };

      // Act
      const result = service['removePassword'](userWithPassword);

      // Assert
      expect(result.password).toBeUndefined();
      expect(result).not.toHaveProperty('password');
    });
  });
});