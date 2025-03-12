import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from './auth.module';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './guard/auth.guard';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { TokenBlacklistService } from './services/token-blacklist.service';

describe('AuthModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn().mockReturnValue('test-secret'),
      })
      .compile();
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should export AuthService', () => {
    const authService = module.get<AuthService>(AuthService);
    expect(authService).toBeDefined();
  });

  it('should export JwtModule', () => {
    const jwtService = module.get(JwtModule);
    expect(jwtService).toBeDefined();
  });

  it('should export TokenBlacklistService', () => {
    const tokenBlacklistService = module.get<TokenBlacklistService>(TokenBlacklistService);
    expect(tokenBlacklistService).toBeDefined();
  });

  it('should have AuthGuard as a provider', () => {
    const authGuard = module.get<AuthGuard>(AuthGuard);
    expect(authGuard).toBeDefined();
  });

  it('should have AuthController', () => {
    const authController = module.get<AuthController>(AuthController);
    expect(authController).toBeDefined();
  });

  it('should configure JwtModule with correct options', () => {
    const configService = module.get<ConfigService>(ConfigService);
    expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
  });

  it('should have circular dependency with UsersModule', () => {
    const imports = Reflect.getMetadata('imports', AuthModule);
    const hasUsersModule = imports.some(
      (imp: any) => imp.name === 'UsersModule'
    );
    expect(hasUsersModule).toBeTruthy();
  });
});