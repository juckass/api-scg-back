import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UserCreationService } from '../services/user-creation.service';
import { UserRetrievalService } from '../services/user-retrieval.service';
import { UserUpdateService } from '../services/user-update.service';
import { UserDeletionService } from '../services/user-deletion.service';
import { UserAuthenticationService } from '../services/user-authentication.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Role } from '../enums/role.enum';

describe('UsersController', () => {
  let controller: UsersController;
  let userCreationService: jest.Mocked<UserCreationService>;
  let userRetrievalService: jest.Mocked<UserRetrievalService>;
  let userUpdateService: jest.Mocked<UserUpdateService>;
  let userDeletionService: jest.Mocked<UserDeletionService>;
  let userAuthenticationService: jest.Mocked<UserAuthenticationService>;

  beforeEach(async () => {
    // Create mocks for all services
    userCreationService = {
      create: jest.fn(),
    } as any;

    userRetrievalService = {
      findAll: jest.fn(),
      findAllDeleted: jest.fn(),
      findOne: jest.fn(),
    } as any;

    userUpdateService = {
      update: jest.fn(),
    } as any;

    userDeletionService = {
      remove: jest.fn(),
      restore: jest.fn(),
    } as any;

    userAuthenticationService = {} as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UserCreationService, useValue: userCreationService },
        { provide: UserRetrievalService, useValue: userRetrievalService },
        { provide: UserUpdateService, useValue: userUpdateService },
        { provide: UserDeletionService, useValue: userDeletionService },
        { provide: UserAuthenticationService, useValue: userAuthenticationService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John',
        rol: Role.USER
      };
      const expectedResult = {
        id: 'test-id',
        ...createUserDto,
        fechaRegistro: new Date(),
        deletedAt: null
      };

    userCreationService.create.mockResolvedValue({
        id: 'test-id', 
        name: 'John',
        email: 'test@example.com',
        password: 'password123',
        fechaRegistro: new Date(),
        deletedAt: null,
        rol: Role.USER  // Making sure rol is included and not optional
    });

      // Act
      const result = await controller.create(createUserDto);

      // Assert
      expect(userCreationService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      // Arrange
      const expectedResult = {
        data: [{
          id: 'test-id',
          email: 'test@example.com',
          name: 'John',
          password: 'hashedPassword',
          fechaRegistro: new Date(),
          deletedAt: null,
          rol: Role.USER  // Making sure rol is included and not optional
        }],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasMore: false
      };
      userRetrievalService.findAll.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.findAll(1, 10);

      // Assert
      expect(userRetrievalService.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result).toEqual(expectedResult);
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
          rol: Role.USER  // Making sure rol is included and not optional
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
    it('should return a single user', async () => {
      // Arrange
      const userId = 'test-id';
      const expectedResult = {
        id: userId,
        email: 'test@example.com',
        name: 'John',
        password: 'hashedPassword',
        fechaRegistro: new Date(),
        deletedAt: null,
        rol: Role.USER  // Making sure rol is included and not optional
      };
      userRetrievalService.findOne.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.findOne(userId);

      // Assert
      expect(userRetrievalService.findOne).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      // Arrange
      const userId = 'test-id';
      const updateUserDto: UpdateUserDto = { name: 'Updated' };
      const expectedResult = {
        id: userId,
        email: 'test@example.com',
        name: 'John',
        password: 'hashedPassword',
        fechaRegistro: new Date(),
        deletedAt: null,
        rol: Role.USER
      };
      userUpdateService.update.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.update(userId, updateUserDto);

      // Assert
      expect(userUpdateService.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should soft delete a user', async () => {
      // Arrange
      const userId = 'test-id';
      const expectedResult = { message: 'User deleted successfully' };
      userDeletionService.remove.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.remove(userId);

      // Assert
      expect(userDeletionService.remove).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('restore', () => {
    it('should restore a deleted user', async () => {
      // Arrange
      const userId = 'test-id';
      const expectedResult = { message: 'User restored successfully' };
      userDeletionService.restore.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.restore(userId);

      // Assert
      expect(userDeletionService.restore).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
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