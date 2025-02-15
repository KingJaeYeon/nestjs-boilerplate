import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import * as crypto from 'crypto';
import { addMinutes } from 'date-fns';
import { CoreException, ErrorCode } from '@/common/exception';
import { CreateTokenDto, TokenDto } from '@/apis/verification/dto';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { VerificationType } from '@prisma/client';

@Injectable()
export class VerificationService {
  constructor(
    private readonly db: PrismaService,
    private readonly configService: ConfigService
  ) {}

  generateEmailVerificationToken({ type = 'base64' }: { type?: 'base64' | 'string' } = {}): string {
    const base64 = crypto.randomBytes(32).toString('base64');
    const string = Math.random().toString(36).slice(2, 13);
    return type === 'base64' ? base64 : string;
  }

  async sendSignupMail(email: string) {
    const isExistUser = await this.db.user.findUnique({
      where: { email }
    });

    if (!!isExistUser) {
      throw new CoreException(ErrorCode.USER_ALREADY_EXISTS);
    }
    const token = await this.createVerification(
      { type: VerificationType.EMAIL_VERIFICATION, email },
      'string'
    );

    const template = `<div>
                <h2>Referenceforall signup code</h2>
                <div class="email" style="font-size: 1.1em;">Email : ${email}</div>
                <div class="message" style="font-size: 1.1em;">code : </div>
                <pre class="message" style="font-size: 1.2em;">${token}</pre>
            </div>`;

    this.sendMail(email, { subject: 'signup verify code', template });
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

  async createVerification(
    data: CreateTokenDto,
    tokenType: 'base64' | 'string' = 'base64'
  ): Promise<string> {
    const { userId, type, email } = data;
    const token = this.generateEmailVerificationToken({ type: tokenType });

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

  async verifyEmailToken(query: TokenDto): Promise<number> {
    const { type, token, email, userId } = query;
    const result = await this.findEmailVerificationToken({ email, token, type, userId });

    if (!result) {
      console.error(`Token not found or type mismatch. Token: ${token}, Type: ${type}`);
      throw new CoreException(ErrorCode.INVALID_TOKEN);
    }

    const isExpired = result.expiredAt < new Date();
    if (isExpired) {
      console.error(`Token expired. Token: ${token}, Expired At: ${result.expiredAt}`);
      throw new CoreException(ErrorCode.TOKEN_EXPIRED);
    }

    return result.id;
  }

  async cleanExpiredTokens(): Promise<void> {
    await this.db.verification.deleteMany({
      where: { expiredAt: { lt: new Date() } }
    });
  }

  async markTokenAsVerified(id: number): Promise<void> {
    await this.db.verification.update({
      where: { id },
      data: { verified: true }
    });
  }

  private sendMail(
    email: string,
    content: {
      subject: string;
      file?: any;
      template: string;
    }
  ) {
    const from = this.configService.get('MAIL_FROM');
    const transporter = nodemailer.createTransport({
      port: 587,
      host: 'smtp.gmail.com',
      auth: {
        user: from, //송신할 이메일
        pass: this.configService.get('MAIL_PASS')
      }
    });
    const mailOptions = {
      from: from, //송신할 이메일
      to: email, //수신할 이메일
      subject: content.subject,
      html: content.template,
      attachments: content.file
    };
    transporter
      .sendMail(mailOptions)
      .then(() => console.log('저장 및 발송 성공'))
      .catch(() => console.log('에러'));
  }

  async findEmailVerificationToken({
    email,
    token,
    type,
    userId,
    verified
  }: {
    email: string;
    token: string;
    type: VerificationType;
    userId?: string;
    verified?: boolean;
  }) {
    return this.db.verification.findUnique({
      where: {
        email_token_type: { email, token, type },
        ...(userId !== undefined && { userId }),
        ...(verified !== undefined && { verified })
      }
    });
  }
}
