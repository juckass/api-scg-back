import { forwardRef, Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { GlobalModule } from '../global/global.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UserCreationService } from './services/user-creation.service';
import { UserRetrievalService } from './services/user-retrieval.service';
import { UserUpdateService } from './services/user-update.service';
import { UserDeletionService } from './services/user-deletion.service';
import { UserAuthenticationService } from './services/user-authentication.service';
import { AuthModule } from "../auth/auth.module";



@Module({
  imports: [GlobalModule, PrismaModule, forwardRef(() => AuthModule) ],
  controllers: [UsersController],
  providers: [
    UserCreationService,
    UserRetrievalService,
    UserUpdateService,
    UserDeletionService,
    UserAuthenticationService,
  ],
  exports: [UserAuthenticationService],
})
export class UsersModule {}
