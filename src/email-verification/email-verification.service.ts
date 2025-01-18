import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { addMinutes } from 'date-fns';
import * as crypto from 'crypto';
import { CoreException, ErrorCode } from '@/common/exception';

@Injectable()
export class EmailVerificationService {
  constructor(private readonly db: PrismaService) {}

  generateToken(): string {
    return crypto.randomBytes(32).toString('base64');
  }

  async createVerification(userId: string, email: string): Promise<string> {
    const token = this.generateToken();

    // 이전 인증 요청 제거 (중복 방지)
    await this.db.emailVerification.deleteMany({
      where: { userId, verified: false },
    });

    // 새 인증 요청 저장
    await this.db.emailVerification.create({
      data: {
        userId,
        email,
        token,
        expiresAt: addMinutes(new Date(), 30), // 30분 유효
      },
    });

    return token;
  }

  async verifyToken(token: string): Promise<void> {
    const record = await this.db.emailVerification.findUnique({
      where: { token },
    });

    if (!record) {
      throw new CoreException(ErrorCode.INVALID_TOKEN);
    }

    if (record.expiresAt < new Date()) {
      throw new CoreException(ErrorCode.TOKEN_EXPIRED);
    }

    // 인증 완료 처리
    await this.db.emailVerification.update({
      where: { id: record.id },
      data: { verified: true },
    });
  }

  async cleanExpiredTokens(): Promise<void> {
    await this.db.emailVerification.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}
