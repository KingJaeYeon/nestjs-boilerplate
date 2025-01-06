import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  // @Matches(pwdPattern)
  @IsString()
  password: string;
}
