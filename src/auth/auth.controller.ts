import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './services/auth.service';
import { SignInUserDto } from './dto/sign-in-user.dto';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { AuthGuard } from './guard/auth.guard';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    description: 'Datos necesarios para iniciar sesión',
    type: SignInUserDto,
    examples: {
      example1: {
        summary: 'Ejemplo de inicio de sesión',
        value: {
          username: 'johndoe',
          password: 'password123',
        },
      },
    },
  })
  async signIn(@Body() signInUserDto: SignInUserDto): Promise<any> {
    return this.authService.signIn(signInUserDto);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request) {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      this.tokenBlacklistService.add(token);
    }
    return { message: 'Logged out successfully' };
  }
}
