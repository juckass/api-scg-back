import { Test, TestingModule } from '@nestjs/testing';
import { UserUpdateService } from '../user-update.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { User } from '@prisma/client';

describe('UserUpdateService', () => {
  let service: UserUpdateService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    // Create mock PrismaService
    prismaService = {
      user: {
        update: jest.fn(),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserUpdateService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<UserUpdateService>(UserUpdateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      // Arrange
      const userId = 'test-user-id';
      const updateUserDto: UpdateUserDto = {
        name: 'John',
        email: 'john.doe@example.com',
      };

      const mockUser: User = {
        id: userId,
        name: 'John',
      
        email: 'john.doe@example.com',
        password: 'hashedPassword',
        fechaRegistro: new Date(),
        deletedAt: null,
      };

      (prismaService.user.update as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await service.update(userId, updateUserDto);

      // Assert
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId, deletedAt: null },
        data: updateUserDto,
      });

      expect(result).toEqual({
        ...mockUser,
        password: undefined,
      });
    });

    it('should throw an error if user not found', async () => {
      // Arrange
      const userId = 'non-existent-id';
      const updateUserDto: UpdateUserDto = {
        name: 'John',
      };

      (prismaService.user.update as jest.Mock).mockRejectedValue(new Error('User not found'));

      // Act & Assert
      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        'User not found',
      );
    });

    it('should update partial user data', async () => {
      // Arrange
      const userId = 'test-user-id';
      const updateUserDto: UpdateUserDto = {
        name: 'John',
      };

      const mockUser: User = {
        id: userId,
        name: 'John',
        email: 'existing@example.com',
        password: 'hashedPassword',
        fechaRegistro: new Date(),
        deletedAt: null,
      };

      (prismaService.user.update as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await service.update(userId, updateUserDto);

      // Assert
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId, deletedAt: null },
        data: updateUserDto,
      });

      expect(result).toEqual({
        ...mockUser,
        password: undefined,
      });
    });
  });
});