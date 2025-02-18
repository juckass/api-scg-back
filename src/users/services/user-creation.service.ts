import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerService } from 'src/global/services/logger.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { hash } from 'bcrypt';
import { User } from '@prisma/client';
import { removePassword } from '../utils/functions';

@Injectable()
export class UserCreationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User | { error: string }> {
    const { password } = createUserDto;
    const plainTextPassword = await hash(password, 10);
    createUserDto = { ...createUserDto, password: plainTextPassword };
    const user = await this.prisma.user.create({ data: createUserDto });

    if (!user) {
      await this.logger.error('Error creating user');
      return { error: 'Error creating user' };
    }

    return removePassword(user);
  }
  
}