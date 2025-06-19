// src/modules/auth/dtos/resend-otp.dto.ts
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class ResendOtpDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @Length(4, 16)
  // indica tipo: "verification" o "reset"
  type!: string;
}
