import { Test, TestingModule } from '@nestjs/testing';
import { UserCreationService } from '../user-creation.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { LoggerService } from '../../../global/services/logger.service';
import { CreateUserDto } from '../../dto/create-user.dto';
import { hash } from 'bcrypt';
import { User } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { createTestingModule } from '../../../test-setup';
import { Role } from '../../enums/role.enum';

describe('UserCreationService', () => {
  let service: UserCreationService;
  let prismaService: PrismaService;
  let loggerService: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await createTestingModule([
      UserCreationService,
      {
        provide: PrismaService,
        useValue: {
          user: {
            create: jest.fn(), // Mock de PrismaService
          },
        },
      },
      {
        provide: LoggerService,
        useValue: {
          error: jest.fn(), // Mock de LoggerService
        },
      },
    ]);

    service = module.get<UserCreationService>(UserCreationService);
    prismaService = module.get<PrismaService>(PrismaService);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user successfully', async () => {
    const createUserDto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    const hashedPassword = await hash(createUserDto.password, 10);
    const user: User = {
      id: uuidv4(),
      email: createUserDto.email,
      password: hashedPassword,
      name: 'Test User',
      fechaRegistro: new Date(),
      deletedAt: null,
      rol: Role.USER
    };

    jest.spyOn(prismaService.user, 'create').mockResolvedValue(user);

    const result = await service.create(createUserDto);

    expect(result).toEqual(expect.objectContaining({
      id: user.id,
      email: user.email,
      name: user.name,
    }));
  });

  it('should return an error if user creation fails', async () => {
    const createUserDto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    jest.spyOn(prismaService.user, 'create').mockResolvedValue(null);

    const result = await service.create(createUserDto);

    expect(result).toEqual({ error: 'Error creating user' });
    expect(loggerService.error).toHaveBeenCalledWith('Error creating user');
  });

  it('should return an error if password is too short', async () => {
    const createUserDto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'short',
    };

    try {
      await service.create(createUserDto);
    } catch (error) {
      expect(error.response).toEqual(['password has wrong value short, password must be longer than or equal to 6 characters']);
      expect(loggerService.error).toHaveBeenCalledWith('password has wrong value short, password must be longer than or equal to 6 characters');
    }
  });

  it('should return an error if password is too long', async () => {
    const createUserDto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'thispasswordiswaytoolongtobeacceptedbythesystem',
    };

    try {
      await service.create(createUserDto);
    } catch (error) {
      expect(error.response).toEqual(['password has wrong value thispasswordiswaytoolongtobeacceptedbythesystem, password must be shorter than or equal to 12 characters']);
      expect(loggerService.error).toHaveBeenCalledWith('password has wrong value thispasswordiswaytoolongtobeacceptedbythesystem, password must be shorter than or equal to 12 characters');
    }
  });
});