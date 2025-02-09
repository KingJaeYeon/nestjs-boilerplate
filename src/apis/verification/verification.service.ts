import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import crypto from 'crypto';
import { addMinutes } from 'date-fns';
import { CoreException, ErrorCode } from '@/common/exception';
import { CreateTokenDto, TokenDto } from '@/apis/verification/dto';

@Injectable()
export class VerificationService {
  constructor(private readonly db: PrismaService) {}

  generateToken(): string {
    return crypto.randomBytes(32).toString('base64');
  }

  async sendVerificationEmail(data: CreateTokenDto): Promise<void> {
    // 1) 인증 요청 생성 및 토큰 발급
    const token = await this.createVerification(data);
    const { type, email } = data;

    // 2) 인증 링크 생성
    const verificationLink = `https://yourdomain.com/verification/verify?token=${encodeURIComponent(token)}&type=${encodeURIComponent(type)}`;

    // 3) 이메일 발송 로직 (이메일 라이브러리 사용)
    console.log(`Send email to ${email} with link: ${verificationLink}`);

    // 실제로는 이메일 발송 라이브러리 (예: Nodemailer) 사용
    // const transporter = nodemailer.createTransport({
    //   service: 'Gmail',
    //   auth: {
    //     user: 'your-email@gmail.com',
    //     pass: 'your-email-password',
    //   },
    // });
    //
    // await transporter.sendMail({
    //   from: '"Your App" <your-email@gmail.com>',
    //   to: email,
    //   subject: 'Verify your email',
    //   text: `Please verify your email by clicking this link: ${verificationLink}`,
    // });
  }

  async createVerification(data: CreateTokenDto): Promise<string> {
    const { userId, type, email } = data;
    const token = this.generateToken();

    // 이전 인증 요청 제거 (중복 방지)
    await this.db.verification.deleteMany({ where: { type, email, verified: false } });

    // 새 인증 요청 저장
    await this.db.verification.create({
      data: {
        type,
        email,
        userId,
        token,
        expiredAt: addMinutes(new Date(), 30) // 30분 유효
      }
    });

    return token;
  }

  async verifyToken(query: TokenDto): Promise<void> {
    const { type, token, email } = query;
    const record = await this.db.verification.findUnique({
      where: {
        email_token_type: { email, token, type }
      }
    });

    if (!record || record.type !== type) {
      console.error(`Token not found or type mismatch. Token: ${token}, Type: ${type}`);
      throw new CoreException(ErrorCode.INVALID_TOKEN);
    }

    if (record.expiredAt < new Date()) {
      console.error(`Token expired. Token: ${token}, Expired At: ${record.expiredAt}`);
      throw new CoreException(ErrorCode.TOKEN_EXPIRED);
    }

    await this.markTokenAsVerified(record.id);
  }

  async cleanExpiredTokens(): Promise<void> {
    await this.db.verification.deleteMany({
      where: { expiredAt: { lt: new Date() } }
    });
  }

  private async markTokenAsVerified(id: number): Promise<void> {
    await this.db.verification.update({
      where: { id },
      data: { verified: true }
    });
  }
}
