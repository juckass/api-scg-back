import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerService } from '../global/services/logger.service';
import { hash } from 'bcrypt';
import { User } from '@prisma/client';
import { PaginationService } from '../global/services/pagination.service';
import { PaginationParams } from 'src/global/interfaces/pagination-params.interface';
import { PaginationResult } from 'src/global/interfaces/pagination-result.interface';

@Injectable()
export class UsersService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly paginationService: PaginationService,
  ) {}

  async create(createUserDto: CreateUserDto) {

    const { password } = createUserDto;
    
    const plainTextPassword = await hash(password, 10);
    
    createUserDto = {...createUserDto, password: plainTextPassword};
    
    const user =  await this.prisma.user.create({
      data: createUserDto,
    });

    if (!user) { 
      await this.logger.error('Error creating user');
      return { error: 'Error creating user' };
    } 

    return this.removePassword(user);
  }

  async findAll(params: PaginationParams): Promise<PaginationResult<User>> {
    const data =  await this.paginationService.paginate<User>(this.prisma, this.prisma.user, params, { deletedAt: null });
    data.data = data.data.map(this.removePassword);
    return data;
  }

  async findAllDeleted(params: PaginationParams): Promise<PaginationResult<User>> {
    const data = await this.paginationService.paginate<User>(this.prisma, this.prisma.user, {}, { deletedAt: { not: null } });
    data.data = data.data.map(this.removePassword);
    return data;
  }

  async findOne(id: string) {
    const user =   await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      await  this.logger.error(`User with id ${id} not found`);
      return {error: `User with id ${id} not found`};
    }
    //delete user.password;
    return this.removePassword(user);
  }

  async  update(id: string, updateUserDto: UpdateUserDto) {
    const user =  await this.prisma.user.update({
      where: { id, deletedAt: null },
      data: updateUserDto,
    });

    return this.removePassword(user);
  }

  async remove(id: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() }, // Marcar como eliminado
    });

    if (!user) {
      await this.logger.error(`User with id ${id} not found`);
      return { error: `User with id ${id} not found` };
    }
    return { message: `User with id ${id} has been soft deleted` };
  }

  protected removePassword(user: User) {
    delete user.password;
    return user;
  }

  async restore(id: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: null }, // Restaurar usuario
    });

    if (!user) {
      await this.logger.error(`User with id ${id} not found`);
      return { error: `User with id ${id} not found` };
    }
    return { message: `User with id ${id} has been restored` };
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      await this.logger.error(`User with email ${email} not found`);
      return { error: `User not found` };
    }
    return this.removePassword(user);
  }

}
