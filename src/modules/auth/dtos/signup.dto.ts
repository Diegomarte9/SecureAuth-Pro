// src/modules/auth/dtos/signup.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, Validate } from 'class-validator';

export class SignupDto {
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
  @Validate((o: SignupDto) => o.password, { message: 'Las contraseñas no coinciden' })
  passwordConfirm!: string;
}
