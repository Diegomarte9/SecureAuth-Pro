// src/modules/auth/dtos/reset-password.dto.ts
import { IsEmail, IsNotEmpty, Matches, Length, Validate } from 'class-validator';
import { PasswordsMatchValidator } from '../../../shared/passwordsMatch.validator';

export class ResetPasswordDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @Length(6, 6, { message: 'El código OTP debe tener 6 dígitos' })
  code!: string;

  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/, {
    message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo'
  })
  newPassword!: string;

  @IsNotEmpty()
  @Validate(PasswordsMatchValidator, ['newPassword', 'newPasswordConfirm'])
  newPasswordConfirm!: string;
}
