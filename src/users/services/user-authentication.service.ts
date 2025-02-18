import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerService } from 'src/global/services/logger.service';
import { User } from '@prisma/client';

@Injectable()
export class UserAuthenticationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async findByEmail(email: string): Promise<User | { error: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      await this.logger.error(`User with email ${email} not found`);
      return { error: `User not found` };
    }

    return this.removePassword(user);
  }

  private removePassword(user: User) {
    delete user.password;
    return user;
  }
}