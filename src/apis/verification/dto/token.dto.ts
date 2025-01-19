import { VerificationType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class TokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsEnum(VerificationType)
  type: VerificationType;
}
