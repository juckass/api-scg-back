import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '@prisma/client';
import { removePassword } from '../utils/functions';


@Injectable()
export class UserUpdateService {
  constructor(private readonly prisma: PrismaService) {}

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id, deletedAt: null },
      data: updateUserDto,
    });

    return removePassword(user);
  }

 
}