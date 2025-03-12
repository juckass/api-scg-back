import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserAuthenticationService } from '../../../users/services/user-authentication.service';
import { Role } from '../../../users/enums/role.enum';
import * as bcrypt from 'bcrypt';
import { SignInUserDto } from '../../dto/sign-in-user.dto';

describe('AuthService', () => {
  let service: AuthService;
  let userAuthService: jest.Mocked<UserAuthenticationService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const userServiceMock = {
      findByEmail: jest.fn(),
    };

    const jwtServiceMock = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserAuthenticationService,
          useValue: userServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userAuthService = module.get(UserAuthenticationService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should return access token when credentials are valid', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: 'test-id',
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        fechaRegistro: new Date(),
        deletedAt: null,
        rol: Role.USER
      };

      userAuthService.findByEmail.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue('token123');

      const signInDto: SignInUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock bcrypt.compare to return true
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await service.signIn(signInDto);

      expect(result).toEqual({ access_token: 'token123' });
      expect(userAuthService.findByEmail).toHaveBeenCalledWith(signInDto.email);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.rol,
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
        name: 'Test User',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        fechaRegistro: new Date(),
        deletedAt: null,
        rol: Role.USER  // Changed from 'role' to 'rol'
      };

      userAuthService.findByEmail.mockResolvedValue(mockUser);
      
      // Add this mock before the test
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      const signInDto: SignInUserDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(service.signIn(signInDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
