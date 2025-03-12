import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersModule } from './users.module';
import { GlobalModule } from '../global/global.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UserCreationService } from './services/user-creation.service';
import { UserRetrievalService } from './services/user-retrieval.service';
import { UserUpdateService } from './services/user-update.service';
import { UserDeletionService } from './services/user-deletion.service';
import { UserAuthenticationService } from './services/user-authentication.service';
import { Logger } from '@nestjs/common';

describe('UsersModule', () => {
  let module: TestingModule;
  let userCreationService: UserCreationService;
  let userRetrievalService: UserRetrievalService;
  let userUpdateService: UserUpdateService;
  let userDeletionService: UserDeletionService;
  let userAuthenticationService: UserAuthenticationService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [UsersModule, GlobalModule, PrismaModule],
      providers: [
        {
          provide: Logger,
          useValue: {
            error: jest.fn(),
            log: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    userCreationService = module.get<UserCreationService>(UserCreationService);
    userRetrievalService = module.get<UserRetrievalService>(UserRetrievalService);
    userUpdateService = module.get<UserUpdateService>(UserUpdateService);
    userDeletionService = module.get<UserDeletionService>(UserDeletionService);
    userAuthenticationService = module.get<UserAuthenticationService>(UserAuthenticationService);
  });

  it('should provide UserCreationService', () => {
    expect(userCreationService).toBeDefined();
  });

  it('should provide UserRetrievalService', () => {
    expect(userRetrievalService).toBeDefined();
  });

  it('should provide UserUpdateService', () => {
    expect(userUpdateService).toBeDefined();
  });

  it('should provide UserDeletionService', () => {
    expect(userDeletionService).toBeDefined();
  });

  it('should provide UserAuthenticationService', () => {
    expect(userAuthenticationService).toBeDefined();
  });

  it('should provide UsersController', () => {
    const usersController = module.get<UsersController>(UsersController);
    expect(usersController).toBeDefined();
  });
});