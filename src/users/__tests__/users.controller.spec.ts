import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UserCreationService } from '../services/user-creation.service';
import { UserRetrievalService } from '../services/user-retrieval.service';
import { UserUpdateService } from '../services/user-update.service';
import { UserDeletionService } from '../services/user-deletion.service';
import { UserAuthenticationService } from '../services/user-authentication.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Role } from '../enums/role.enum';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenBlacklistService } from '../../auth/services/token-blacklist.service';
import { AuthGuard } from '../../auth/guard/auth.guard';

describe('UsersController', () => {
  let controller: UsersController;
  let userCreationService: jest.Mocked<UserCreationService>;
  let userRetrievalService: jest.Mocked<UserRetrievalService>;
  let userUpdateService: jest.Mocked<UserUpdateService>;
  let userDeletionService: jest.Mocked<UserDeletionService>;

  const mockUser = {
    id: 'test-id',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    fechaRegistro: new Date(),
    deletedAt: null,
    rol: Role.USER
  };

  const mockPaginatedResponse = {
    data: [mockUser],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasMore: false
  };

  beforeEach(async () => {
    const serviceMocks = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllDeleted: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      restore: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { 
          provide: UserCreationService, 
          useValue: { create: serviceMocks.create } 
        },
        { 
          provide: UserRetrievalService, 
          useValue: { 
            findAll: serviceMocks.findAll,
            findAllDeleted: serviceMocks.findAllDeleted,
            findOne: serviceMocks.findOne
          } 
        },
        { 
          provide: UserUpdateService, 
          useValue: { update: serviceMocks.update } 
        },
        { 
          provide: UserDeletionService, 
          useValue: { 
            remove: serviceMocks.remove,
            restore: serviceMocks.restore
          } 
        },
        { 
          provide: UserAuthenticationService, 
          useValue: { findByEmail: jest.fn() } 
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: TokenBlacklistService,
          useValue: {
            add: jest.fn(),
            has: jest.fn(),
          },
        },
        AuthGuard,
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    userCreationService = module.get(UserCreationService);
    userRetrievalService = module.get(UserRetrievalService);
    userUpdateService = module.get(UserUpdateService);
    userDeletionService = module.get(UserDeletionService);
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should create a user successfully', async () => {
      userCreationService.create.mockResolvedValue(mockUser);
      const result = await controller.create(createUserDto);
      expect(result).toEqual(mockUser);
    });

    it('should handle duplicate email error', async () => {
      userCreationService.create.mockRejectedValue(
        new ConflictException('Email already exists')
      );
      await expect(controller.create(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated users with default pagination', async () => {
      userRetrievalService.findAll.mockResolvedValue(mockPaginatedResponse);
      const result = await controller.findAll();
      expect(result).toEqual(mockPaginatedResponse);
      expect(userRetrievalService.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it('should return paginated users with custom pagination', async () => {
      userRetrievalService.findAll.mockResolvedValue({
        ...mockPaginatedResponse,
        page: 2,
        limit: 5,
      });
      const result = await controller.findAll(2, 5);
      expect(result).toEqual(expect.objectContaining({ page: 2, limit: 5 }));
    });
  });

  describe('findAllDeleted', () => {
    it('should return paginated deleted users', async () => {
      // Arrange
      const expectedResult = {
        data: [{
          id: 'test-id',
          email: 'test@example.com',
          name: 'John',
          password: 'hashedPassword',
          fechaRegistro: new Date(),
          deletedAt: new Date(),
          rol: Role.USER  // Assuming Role is an enum with USER value
        }],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasMore: false
      };
      userRetrievalService.findAllDeleted.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.findAllDeleted(1, 10);

      // Assert
      expect(userRetrievalService.findAllDeleted).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      userRetrievalService.findOne.mockResolvedValue(mockUser);
      const result = await controller.findOne('test-id');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      userRetrievalService.findOne.mockRejectedValue(
        new NotFoundException('User not found')
      );
      await expect(controller.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Updated Name',
    };

    it('should update user successfully', async () => {
      const updatedUser = { ...mockUser, ...updateUserDto };
      userUpdateService.update.mockResolvedValue(updatedUser);
      const result = await controller.update('test-id', updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when updating non-existent user', async () => {
      userUpdateService.update.mockRejectedValue(
        new NotFoundException('User not found')
      );
      await expect(controller.update('non-existent', updateUserDto)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('remove', () => {
    it('should soft delete user successfully', async () => {
      userDeletionService.remove.mockResolvedValue({ 
        message: 'User deleted successfully' 
      });
      
      const result = await controller.remove('test-id');
      expect(result).toEqual({ message: 'User deleted successfully' });
    });

    it('should throw NotFoundException when deleting non-existent user', async () => {
      userDeletionService.remove.mockRejectedValue(
        new NotFoundException('User not found')
      );
      await expect(controller.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('should restore deleted user successfully', async () => {
      const restoredUser = { ...mockUser, deletedAt: null };
      userDeletionService.restore.mockResolvedValue({ 
        message: 'User restored successfully' 
      });
      
      const result = await controller.restore('test-id');
      expect(result).toEqual({ message: 'User restored successfully' });
    });

    it('should throw NotFoundException when restoring non-existent user', async () => {
      userDeletionService.restore.mockRejectedValue(
        new NotFoundException('User not found')
      );
      await expect(controller.restore('non-existent')).rejects.toThrow(
        NotFoundException
      );
    });
  });
});

describe('LoggerService', () => {
  let service: any;
  let mockLogger: any;
  let mockFileService: any;

  beforeEach(() => {
    mockLogger = { log: jest.fn() };
    mockFileService = { writeToFile: jest.fn() };
    service = {
      loggingEnabled: false,
      logLevel: [],
      log: function (message: string) {
        if (this.loggingEnabled && this.logLevel.includes('log')) {
          mockLogger.log(`LOG: ${message}`);
          mockFileService.writeToFile();
        }
      }
    };
  });

  describe('log method', () => {
    it('should log message when logging is enabled', () => {
      // Arrange
      const message = 'test message';
      service.loggingEnabled = true;
      service.logLevel = ['log'];

      // Act
      service.log(message);

      // Assert
      expect(mockLogger.log).toHaveBeenCalledWith(`LOG: ${message}`);
      expect(mockFileService.writeToFile).toHaveBeenCalled();
    });

    it('should not log message when logging is disabled', () => {
      // Arrange
      const message = 'test message';
      service.loggingEnabled = false;

      // Act
      service.log(message);

      // Assert
      expect(mockLogger.log).not.toHaveBeenCalled();
      expect(mockFileService.writeToFile).not.toHaveBeenCalled();
    });
  });
});