import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerService } from '../../global/services/logger.service';
import { User } from '@prisma/client';

@Injectable()
export class UserAuthenticationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user;
  
  }

  private removePassword(user: User) {
    delete user.password;
    return user;
  }
}