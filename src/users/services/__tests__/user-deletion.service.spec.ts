import { Test, TestingModule } from '@nestjs/testing';
import { UserDeletionService } from '../user-deletion.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { LoggerService } from '../../../global/services/logger.service';

describe('UserDeletionService', () => {
  let service: UserDeletionService;
  let prismaService: jest.Mocked<PrismaService>;
  let loggerService: jest.Mocked<LoggerService>;

  beforeEach(async () => {
    // Create mocks
    prismaService = {
      user: {
        update: jest.fn(),
      },
    } as any;

    loggerService = {
      error: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserDeletionService,
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

    service = module.get<UserDeletionService>(UserDeletionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('remove', () => {
    it('should soft delete a user successfully', async () => {
      // Arrange
      const userId = 'test-id';
      const mockUser = {
        id: userId,
        deletedAt: new Date(),
      };

      (prismaService.user.update as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await service.remove(userId);

      // Assert
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { deletedAt: expect.any(Date) },
      });
      expect(result).toEqual({
        message: `User with id ${userId} has been soft deleted`,
      });
    });

    it('should return error when user not found for deletion', async () => {
      // Arrange
      const userId = 'non-existent-id';
      (prismaService.user.update as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await service.remove(userId);

      // Assert
      expect(loggerService.error).toHaveBeenCalledWith(
        `User with id ${userId} not found`,
      );
      expect(result).toEqual({
        error: `User with id ${userId} not found`,
      });
    });

    it('should handle database errors during deletion', async () => {
      // Arrange
      const userId = 'test-id';
      (prismaService.user.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.remove(userId)).rejects.toThrow('Database error');
    });
  });

  describe('restore', () => {
    it('should restore a deleted user successfully', async () => {
      // Arrange
      const userId = 'test-id';
      const mockUser = {
        id: userId,
        deletedAt: null,
      };

      (prismaService.user.update as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await service.restore(userId);

      // Assert
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { deletedAt: null },
      });
      expect(result).toEqual({
        message: `User with id ${userId} has been restored`,
      });
    });

    it('should return error when user not found for restoration', async () => {
      // Arrange
      const userId = 'non-existent-id';
      (prismaService.user.update as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await service.restore(userId);

      // Assert
      expect(loggerService.error).toHaveBeenCalledWith(
        `User with id ${userId} not found`,
      );
      expect(result).toEqual({
        error: `User with id ${userId} not found`,
      });
    });

    it('should handle database errors during restoration', async () => {
      // Arrange
      const userId = 'test-id';
      (prismaService.user.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.restore(userId)).rejects.toThrow('Database error');
    });
  });
});