import { IsEmail, IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { Role } from '../enums/role.enum';

export class UpdateUserDto  {
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    name? : string;

    @IsOptional()
    @IsNotEmpty()
    @IsEmail()         
    email? : string;


    @IsEnum(Role)
    @IsOptional()
    rol?: Role = Role.USER;
}
