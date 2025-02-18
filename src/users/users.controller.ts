import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { UserCreationService } from './services/user-creation.service';
import { UserRetrievalService } from './services/user-retrieval.service';
import { UserUpdateService } from './services/user-update.service';
import { UserDeletionService } from './services/user-deletion.service';
import { UserAuthenticationService } from './services/user-authentication.service';

//@ApiBearerAuth()
@ApiTags('users')
//@UseGuards(JwtAuthGuard)
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
  create(@Body() createUserDto: CreateUserDto) {
    return this.userCreationService.create(createUserDto);
  }

  @Get()
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.userRetrievalService.findAll({ page, limit });
  }

  @Get('deleted')
  findAllDeleted(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.userRetrievalService.findAllDeleted({ page, limit });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userRetrievalService.findOne(id);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.userDeletionService.restore(id);
  }
  
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userUpdateService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userDeletionService.remove(id);
  }
}
