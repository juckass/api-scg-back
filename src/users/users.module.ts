import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { GlobalModule } from 'src/global/global.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserCreationService } from './services/user-creation.service';
import { UserRetrievalService } from './services/user-retrieval.service';
import { UserUpdateService } from './services/user-update.service';
import { UserDeletionService } from './services/user-deletion.service';
import { UserAuthenticationService } from './services/user-authentication.service';

@Module({
  imports: [GlobalModule, PrismaModule],
  controllers: [UsersController],
  providers: [
    UserCreationService,
    UserRetrievalService,
    UserUpdateService,
    UserDeletionService,
    UserAuthenticationService,
  ],
})
export class UsersModule {}
