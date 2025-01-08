import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}
