import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './services/auth.service';
import  { SignInUserDto } from './dto/sign-in-user.dto'
import { TokenBlacklistService } from './services/token-blacklist.service';
import { AuthGuard } from './guard/auth.guard';


@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly tokenBlacklistService: TokenBlacklistService,

        
    ) {}
    
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async signIn(@Body() signInUserDto : SignInUserDto): Promise<any> {
        return this.authService.signIn(signInUserDto);
    }


    @UseGuards(AuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Req() req: Request) {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        this.tokenBlacklistService.add(token);
      }
      return { message: 'Logged out successfully' };
    }
}
