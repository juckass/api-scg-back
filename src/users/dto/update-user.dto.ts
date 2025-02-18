import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto  {
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    name? : string;

    @IsOptional()
    @IsNotEmpty()
    @IsEmail()         
    email? : string;
}
