// src/modules/users/dtos/update-user.dto.ts
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, Validate } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsString()
  @Validate((o: UpdateUserDto) => o.password === o.passwordConfirm, { message: 'Las contraseñas no coinciden' })
  passwordConfirm?: string;
}
