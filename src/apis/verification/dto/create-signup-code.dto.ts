import { IsEmail } from 'class-validator';

export class CreateSignupCodeDto {
  @IsEmail()
  email: string;
}
