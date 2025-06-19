// src/modules/auth/dtos/verify-otp.dto.ts
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @Length(6, 6, { message: 'El código OTP debe tener 6 dígitos' })
  code!: string;
}
