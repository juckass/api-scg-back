import { Test, TestingModule } from '@nestjs/testing';
import { UserAuthenticationService } from '../user-authentication.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { LoggerService } from '../../../global/services/logger.service';
import { User } from '@prisma/client';

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
    rol: 'ADMIN',
  };

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
      },
    } as any;

    loggerService = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAuthenticationService,
        { provide: PrismaService, useValue: prismaService },
        { provide: LoggerService, useValue: loggerService },
      ],
    }).compile();

    service = module.get<UserAuthenticationService>(UserAuthenticationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should find and return user without password', async () => {
      const email = 'test@example.com';
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail(email);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual({
        id: 'test-id',
        email: 'test@example.com',
        name: 'John',
        fechaRegistro: mockUser.fechaRegistro,
        deletedAt: null,
        rol: 'ADMIN',
      });
    });

    it('should return undefined and log error when user not found', async () => {
      const email = 'nonexistent@example.com';
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail(email);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(loggerService.error).toHaveBeenCalledWith(
        `User with email ${email} not found`,
      );
      expect(result).toBeUndefined();
    });

    it('should handle database errors', async () => {
      const email = 'test@example.com';
      const dbError = new Error('Database error');
      prismaService.user.findUnique.mockRejectedValue(dbError);

      await expect(service.findByEmail(email)).rejects.toThrow(dbError);
    });
  });

  describe('removePassword', () => {
    it('should remove password from user object', () => {
      const userWithPassword = { ...mockUser };

      const result = service['removePassword'](userWithPassword);

      expect(result.password).toBeUndefined();
      expect(result).not.toHaveProperty('password');
    });
  });
});