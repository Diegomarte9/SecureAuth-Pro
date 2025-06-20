import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, Validate } from 'class-validator';
import { PasswordsMatchValidator } from '../../../shared/passwordsMatch.validator';

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
  @IsNotEmpty()
  first_name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  last_name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/, {
    message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo'
  })
  password?: string;

  @IsOptional()
  @IsString()
  @Validate(PasswordsMatchValidator, ['password', 'passwordConfirm'])
  passwordConfirm?: string;
}