import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  // Permite email o username
  user!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
