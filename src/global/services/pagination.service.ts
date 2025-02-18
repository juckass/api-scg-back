import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PaginationParams } from '../interfaces/pagination-params.interface';
import { PaginationResult } from '../interfaces/pagination-result.interface';


@Injectable()
export class PaginationService {
  async paginate<T>(
    prisma: PrismaClient,
    model: any,
    params: PaginationParams,
    where: any = {}
  ): Promise<PaginationResult<T>> {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    const [data, total] = await prisma.$transaction([
      model.findMany({
        where,
        skip: offset,
        take: limit,
      }),
      model.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasMore,
    };
  }
}