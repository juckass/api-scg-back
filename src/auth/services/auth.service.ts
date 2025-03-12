import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserAuthenticationService } from '../../users/services/user-authentication.service';
import { SignInUserDto } from '../dto/sign-in-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userAuthenticationService: UserAuthenticationService,
    private jwtService: JwtService,
  ) {}

  async signIn(signInUserDto: SignInUserDto): Promise<{ access_token: string }> {
    const user = await this.userAuthenticationService.findByEmail(
      signInUserDto.email,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      signInUserDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.rol,
    };
  
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
