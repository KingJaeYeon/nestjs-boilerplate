import { IsString } from 'class-validator';

export class VerifySignupCodeDto {
  @IsString()
  email: string;

  @IsString()
  verify: string;
}
