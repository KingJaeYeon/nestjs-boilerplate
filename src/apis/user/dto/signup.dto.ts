import { IsEmail, IsString, Matches } from 'class-validator';

// const pwdPattern = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,16}$/;

export class SignupDto {
  @IsEmail()
  email: string;

  // @Matches(pwdPattern)
  @IsString()
  password: string;
}
