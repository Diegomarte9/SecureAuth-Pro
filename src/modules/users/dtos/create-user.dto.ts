import { IsEmail, IsNotEmpty, IsString, Matches, Validate } from 'class-validator';
import { PasswordsMatchValidator } from '../../../shared/passwordsMatch.validator';

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
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/, {
    message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo'
  })
  password!: string;

  @IsString()
  @Validate(PasswordsMatchValidator, ['password', 'passwordConfirm'])
  passwordConfirm!: string;
}
