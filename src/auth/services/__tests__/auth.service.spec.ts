import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserAuthenticationService } from '../../../users/services/user-authentication.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SignInUserDto } from '../../dto/sign-in-user.dto';

describe('AuthService', () => {
  let service: AuthService;
  let userAuthService: jest.Mocked<UserAuthenticationService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    userAuthService = {
      findByEmail: jest.fn(),
      authenticate: jest.fn(),
    } as any;

    jwtService = {
      signAsync: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserAuthenticationService,
          useValue: userAuthService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile(); 

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should return access token when credentials are valid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'USER',
      };

      userAuthService.findByEmail.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue('token123');

      const signInDto: SignInUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await service.signIn(signInDto);

      expect(result).toEqual({ access_token: 'token123' });
      expect(userAuthService.findByEmail).toHaveBeenCalledWith(signInDto.email);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      userAuthService.findByEmail.mockResolvedValue(null);

      const signInDto: SignInUserDto = {
        email: 'wrong@example.com',
        password: 'password123',
      };

      await expect(service.signIn(signInDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'USER',
      };

      userAuthService.findByEmail.mockResolvedValue(mockUser);

      const signInDto: SignInUserDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(service.signIn(signInDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
