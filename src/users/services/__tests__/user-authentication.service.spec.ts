import { Test, TestingModule } from '@nestjs/testing';
import { UserAuthenticationService } from '../user-authentication.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { User } from '@prisma/client';

describe('UserAuthenticationService', () => {
  let service: UserAuthenticationService;
  let prismaService: jest.Mocked<PrismaService>;
  let logger: jest.Mocked<Logger>;

  const mockUser: User = {
    id: 'test-id',
    email: 'test@example.com',
    name: 'John',
    password: 'hashedPassword',
    fechaRegistro: new Date(),
    deletedAt: null,
    rol: 'ADMIN',
  };

  beforeEach(async () => {
    const prismaServiceMock = {
      user: {
        findUnique: jest.fn(),
      },
    };

    const loggerMock = {
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAuthenticationService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
        {
          provide: Logger,
          useValue: loggerMock,
        },
      ],
    }).compile();

    service = module.get<UserAuthenticationService>(UserAuthenticationService);
    prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
    logger = module.get(Logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should find and return user', async () => {
      const email = 'test@example.com';
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findByEmail(email);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return undefined and log error when user not found', async () => {
      const email = 'nonexistent@example.com';
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.findByEmail(email);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(logger.error).toHaveBeenCalledWith(
        `User with email ${email} not found`,
      );
      expect(result).toBeUndefined();
    });

    it('should handle database errors', async () => {
      const email = 'test@example.com';
      const dbError = new Error('Database error');
      (prismaService.user.findUnique as jest.Mock).mockRejectedValue(dbError);

      await expect(service.findByEmail(email)).rejects.toThrow(dbError);
    });
  });
});