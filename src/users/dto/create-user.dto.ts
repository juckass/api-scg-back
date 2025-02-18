import { IsEmail, IsNotEmpty, IsString, IsUUID, MaxLength, MinLength } from "class-validator"

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

}
