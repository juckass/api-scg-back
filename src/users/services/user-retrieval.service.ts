import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerService } from 'src/global/services/logger.service';
import { PaginationService } from 'src/global/services/pagination.service';
import { PaginationParams } from 'src/global/interfaces/pagination-params.interface';
import { PaginationResult } from 'src/global/interfaces/pagination-result.interface';
import { User } from '@prisma/client';

import { removePassword } from '../utils/functions';

@Injectable()
export class UserRetrievalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly paginationService: PaginationService,
  ) {}

  async findAll(params: PaginationParams): Promise<PaginationResult<User>> {
    const data = await this.paginationService.paginate<User>(this.prisma, this.prisma.user, params, { deletedAt: null });
    data.data = data.data.map(removePassword);
    return data;
  }

  async findAllDeleted(params: PaginationParams): Promise<PaginationResult<User>> {
    const data = await this.paginationService.paginate<User>(this.prisma, this.prisma.user, {}, { deletedAt: { not: null } });
    data.data = data.data.map(removePassword);
    return data;
  }

  async findOne(id: string): Promise<User | { error: string }> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      await this.logger.error(`User with id ${id} not found`);
      return { error: `User with id ${id} not found` };
    }

    return removePassword(user);
  }


}