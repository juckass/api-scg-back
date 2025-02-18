import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerService } from 'src/global/services/logger.service';

@Injectable()
export class UserDeletionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async remove(id: string): Promise<{ message: string } | { error: string }> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    if (!user) {
      await this.logger.error(`User with id ${id} not found`);
      return { error: `User with id ${id} not found` };
    }

    return { message: `User with id ${id} has been soft deleted` };
  }

  async restore(id: string): Promise<{ message: string } | { error: string }> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: null },
    });

    if (!user) {
      await this.logger.error(`User with id ${id} not found`);
      return { error: `User with id ${id} not found` };
    }

    return { message: `User with id ${id} has been restored` };
  }
}