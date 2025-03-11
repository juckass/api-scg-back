import { IsEmail, IsNotEmpty, IsString, IsUUID, MaxLength, MinLength, IsEnum, IsOptional } from "class-validator"
import { Role } from '../enums/role.enum';
export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    name : string;

    @IsNotEmpty()
    @IsEmail()         
    email : string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(12)          
    password : string;

    @IsEnum(Role)
    @IsOptional()
    rol?: Role ;
}
