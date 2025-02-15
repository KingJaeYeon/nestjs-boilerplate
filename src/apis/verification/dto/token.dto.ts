import { VerificationType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsEnum(VerificationType)
  type: VerificationType;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  userId?: string;
}
