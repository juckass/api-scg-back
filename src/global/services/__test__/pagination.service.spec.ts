import { Test, TestingModule } from '@nestjs/testing';
import { PaginationService } from '../pagination.service';
import { PrismaClient } from '@prisma/client';
import { PaginationParams } from '../../interfaces/pagination-params.interface';

describe('PaginationService', () => {
  let service: PaginationService;
  let mockPrisma: jest.Mocked<PrismaClient>;
  let mockModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaginationService],
    }).compile();

    service = module.get<PaginationService>(PaginationService);

    // Mock del modelo con implementaciones
    mockModel = {
      findMany: jest.fn(),
      count: jest.fn(),
    };

    // Mock de PrismaClient con implementación de $transaction
    mockPrisma = {
      $transaction: jest.fn(),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('paginate', () => {
    it('should return paginated results with default parameters', async () => {
      // Arrange
      const mockData = [{ id: 1 }, { id: 2 }];
      const mockTotal = 2;
      
      mockModel.findMany.mockResolvedValue(mockData);
      mockModel.count.mockResolvedValue(mockTotal);
      mockPrisma.$transaction.mockResolvedValue([mockData, mockTotal]);

      const params: PaginationParams = {};
      const where = {};

      // Act
      const result = await service.paginate(mockPrisma, mockModel, params, where);

      // Assert
      expect(result).toEqual({
        data: mockData,
        total: mockTotal,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasMore: false,
      });
    });

    it('should return paginated results with custom parameters', async () => {
      // Arrange
      const mockData = [{ id: 3 }, { id: 4 }];
      const mockTotal = 6;
      
      mockModel.findMany.mockResolvedValue(mockData);
      mockModel.count.mockResolvedValue(mockTotal);
      mockPrisma.$transaction.mockResolvedValue([mockData, mockTotal]);

      const params: PaginationParams = { page: 2, limit: 2 };
      const where = { active: true };

      // Act
      const result = await service.paginate(mockPrisma, mockModel, params, where);

      // Assert
      expect(result).toEqual({
        data: mockData,
        total: mockTotal,
        page: 2,
        limit: 2,
        totalPages: 3,
        hasMore: true,
      });
    });

    it('should handle empty results', async () => {
      // Arrange
      const mockData: any[] = [];
      const mockTotal = 0;
      
      mockModel.findMany.mockResolvedValue(mockData);
      mockModel.count.mockResolvedValue(mockTotal);
      mockPrisma.$transaction.mockResolvedValue([mockData, mockTotal]);

      const params: PaginationParams = { page: 1, limit: 10 };
      const where = {};

      // Act
      const result = await service.paginate(mockPrisma, mockModel, params, where);
 
      // Assert
      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasMore: false,
      });
    });

    it('should handle last page', async () => {
      // Arrange
      const mockData = [{ id: 9 }, { id: 10 }];
      const mockTotal = 10;
      
      mockModel.findMany.mockResolvedValue(mockData);
      mockModel.count.mockResolvedValue(mockTotal);
      mockPrisma.$transaction.mockResolvedValue([mockData, mockTotal]);

      const params: PaginationParams = { page: 5, limit: 2 };
      const where = {};

      // Act
      const result = await service.paginate(mockPrisma, mockModel, params, where);

      // Assert
      expect(result).toEqual({
        data: mockData,
        total: mockTotal,
        page: 5,
        limit: 2,
        totalPages: 5,
        hasMore: false,
      });
    });
  });
});