import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

// const pwdPattern = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,16}$/;

export class SignupDto {
  @IsIn(['email', 'username'], { message: 'INVALIDATE_TYPE' })
  type: 'email' | 'username';

  @IsString()
  @MinLength(4, { message: 'INVALIDATE_USERNAME' })
  username: string;

  @IsString()
  @IsOptional()
  displayName: string;

  // @Matches(pwdPattern)
  @IsString()
  @MinLength(8, { message: 'INVALIDATE_PASSWORD' })
  password: string;

  @IsString()
  @IsOptional()
  verifyCode: string;
}
