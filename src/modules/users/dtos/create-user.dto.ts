// src/modules/users/dtos/create-user.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  first_name!: string;

  @IsString()
  @IsNotEmpty()
  last_name!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @Matches((o: CreateUserDto) => o.password, { message: 'Las contraseñas no coinciden' })
  passwordConfirm!: string;
}
