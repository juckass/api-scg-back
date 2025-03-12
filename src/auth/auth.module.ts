import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './guard/auth.guard';
import { UsersModule } from '../users/users.module';
import { TokenBlacklistService } from './services/token-blacklist.service';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, AuthGuard, TokenBlacklistService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, TokenBlacklistService],
})
export class AuthModule {}
