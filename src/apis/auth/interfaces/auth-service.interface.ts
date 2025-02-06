import { VerificationType } from '@prisma/client';

export interface IVerifyToken {
  email: string;
  authCode: string;
  type: VerificationType;
  userId?: string;
}
