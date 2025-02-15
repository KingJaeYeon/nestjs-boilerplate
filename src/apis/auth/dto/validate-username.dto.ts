import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ValidateUsernameDto {
  @IsString()
  @IsNotEmpty({ message: 'EMPTY' })
  @MinLength(4, { message: 'MINLENGTH' })
  username: string;
}
