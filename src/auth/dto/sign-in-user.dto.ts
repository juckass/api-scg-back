import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator"

export class SignInUserDto {
    @IsNotEmpty()
    @IsEmail()         
    email : string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(12)          
    password : string;
}
