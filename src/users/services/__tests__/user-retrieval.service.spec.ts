import { Test, TestingModule } from '@nestjs/testing';
import { UserRetrievalService } from '../user-retrieval.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { LoggerService } from '../../../global/services/logger.service';
import { PaginationService } from '../../../global/services/pagination.service';
import { User } from '@prisma/client';

describe('UserRetrievalService', () => {
  let service: UserRetrievalService;
  let prismaService: jest.Mocked<PrismaService>;
  let loggerService: jest.Mocked<LoggerService>;
  let paginationService: jest.Mocked<PaginationService>;

  const mockUser: User = {
    id: 'test-id',
    name: 'John',
    email: 'john@example.com',
    password: 'hashedPassword',
    fechaRegistro: new Date(),
    deletedAt: null,
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

    paginationService = {
      paginate: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRetrievalService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: LoggerService,
          useValue: loggerService,
        },
        {
          provide: PaginationService,
          useValue: paginationService,
        },
      ],
    }).compile();

    service = module.get<UserRetrievalService>(UserRetrievalService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated active users', async () => {
      // Arrange
      const params = { page: 1, limit: 10 };
      const paginatedResult = {
        data: [mockUser],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasMore: false,
      };

      paginationService.paginate.mockResolvedValue(paginatedResult);

      // Act
      const result = await service.findAll(params);

      // Assert
      expect(paginationService.paginate).toHaveBeenCalledWith(
        prismaService,
        prismaService.user,
        params,
        { deletedAt: null },
      );
      expect(result.data[0].password).toBeUndefined();
      expect(result).toEqual({
        ...paginatedResult,
        data: [{ ...mockUser, password: undefined }],
      });
    });
  });

  describe('findAllDeleted', () => {
    it('should return paginated deleted users', async () => {
      // Arrange
      const deletedUser = { ...mockUser, deletedAt: new Date() };
      const paginatedResult = {
        data: [deletedUser],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasMore: false,
      };

      paginationService.paginate.mockResolvedValue(paginatedResult);

      // Act
      const result = await service.findAllDeleted({});

      // Assert
      expect(paginationService.paginate).toHaveBeenCalledWith(
        prismaService,
        prismaService.user,
        {},
        { deletedAt: { not: null } },
      );
      expect(result.data[0].password).toBeUndefined();
      expect(result).toEqual({
        ...paginatedResult,
        data: [{ ...deletedUser, password: undefined }],
      });
    });
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      // Arrange
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await service.findOne('test-id');

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
      expect(result).toEqual({ ...mockUser, password: undefined });
    });

    it('should return error when user not found', async () => {
      // Arrange
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await service.findOne('non-existent-id');

      // Assert
      expect(loggerService.error).toHaveBeenCalledWith(
        'User with id non-existent-id not found',
      );
      expect(result).toEqual({
        error: 'User with id non-existent-id not found',
      });
    });
  });
});