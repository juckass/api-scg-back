import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags, ApiBody } from '@nestjs/swagger';
import { UserCreationService } from './services/user-creation.service';
import { UserRetrievalService } from './services/user-retrieval.service';
import { UserUpdateService } from './services/user-update.service';
import { UserDeletionService } from './services/user-deletion.service';
import { UserAuthenticationService } from './services/user-authentication.service';
import { AuthGuard } from '../auth/guard/auth.guard';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly userCreationService: UserCreationService,
    private readonly userRetrievalService: UserRetrievalService,
    private readonly userUpdateService: UserUpdateService,
    private readonly userDeletionService: UserDeletionService,
    private readonly userAuthenticationService: UserAuthenticationService,
  ) {}

  @Post()
  @ApiBody({
    description: 'Datos necesarios para crear un nuevo usuario',
    type: CreateUserDto,
    examples: {
      example1: {
        summary: 'Ejemplo de usuario',
        value: {
          username: 'johndoe',
          email: 'johndoe@example.com',
          password: 'password123',
        },
      },
    },
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userCreationService.create(createUserDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.userRetrievalService.findAll({ page, limit });
  }

  @UseGuards(AuthGuard)
  @Get('deleted')
  findAllDeleted(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.userRetrievalService.findAllDeleted({ page, limit });
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userRetrievalService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.userDeletionService.restore(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiBody({
    description: 'Datos necesarios para actualizar un usuario',
    type: UpdateUserDto,
    examples: {
      example1: {
        summary: 'Ejemplo de actualización de usuario',
        value: {
          username: 'johnupdated',
          email: 'johnupdated@example.com',
        },
      },
    },
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userUpdateService.update(id, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userDeletionService.remove(id);
  }
}
