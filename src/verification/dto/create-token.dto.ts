import { IsEnum, IsOptional, IsString } from 'class-validator';
import { VerificationType } from '@prisma/client';

export class CreateTokenDto {
  @IsEnum(VerificationType)
  type: VerificationType;

  @IsString()
  email: string;

  @IsString()
  @IsOptional()
  userId?: string;
}
