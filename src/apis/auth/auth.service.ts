import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CoreException, ErrorCode } from '@/common/exception';
import { JwtService } from '@nestjs/jwt';
import { CookieOptions, Response } from 'express';
import { AUTHORIZATION, emailRegex, REFRESH, REFRESH_LOGOUT, usernameRegex } from '@/common/config';
import { LoginDto } from '@/apis/auth/dto';
import { IUserPayload } from '@/apis/auth/interfaces';
import { add } from 'date-fns';
import { User, VerificationType } from '@prisma/client';
import { VerificationService } from '@/apis/verification/verification.service';
import { VerifySignupCodeDto } from '@/apis/auth/dto/verify-signup-code.dto';
import { ValidateUsernameDto } from '@/apis/auth/dto/validate-username.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly db: PrismaService,
    private readonly jwtService: JwtService,
    private readonly verificationService: VerificationService
  ) {}

  async validateLocalUser(data: LoginDto): Promise<IUserPayload> {
    const { username, password } = data;
    const accessId = username.includes('@') ? { email: username } : { username };
    const user = await this.db.user.findUnique({
      where: accessId
    });

    if (!user) {
      throw new CoreException(ErrorCode.USER_NOT_FOUND);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new CoreException(ErrorCode.INVALIDATE_LOGIN);
    }

    return this.buildUserPayload(user);
  }

  async generateJwtTokens(payload: IUserPayload, userAgent: string, ipAddress: string) {
    const accessToken = this.jwtService.sign(
      payload, //
      { expiresIn: '5s' }
    );

    const refreshToken = crypto.randomUUID();

    // db에 refresh token 저장 로직 추가 (선택사항)
    await this.db.refreshToken.create({
      data: {
        token: refreshToken,
        userId: payload.id,
        expiredAt: add(new Date(), { days: 7 }), // 7일 후
        userAgent,
        ipAddress
      }
    });
    return { accessToken, refreshToken };
  }

  async rotateRefreshToken(refreshToken: string, ipAddress: string, userAgent: string) {
    const storedToken = await this.db.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!storedToken) {
      throw new CoreException(ErrorCode.INVALID_REFRESH);
    }

    const invalidToken = storedToken.revoked || storedToken.expiredAt < new Date();
    if (invalidToken) {
      await this.db.refreshToken
        .delete({
          where: { id: storedToken.id }
        })
        .then((r) => console.log('>> invalidToken:: delete', r.id));
      throw new CoreException(ErrorCode.INVALID_REFRESH);
    }

    await this.db.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true }
    });

    const payload: IUserPayload = this.buildUserPayload(storedToken.user);

    return this.generateJwtTokens(payload, ipAddress, userAgent);
  }

  setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    const { accessToken, refreshToken } = tokens;

    const baseOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      domain: process.env.NODE_ENV === 'production' ? '.referenceforall.com' : undefined
    };

    res.cookie(AUTHORIZATION, accessToken, {
      ...baseOptions,
      sameSite: 'lax',
      path: '/'
    });
    res.cookie(REFRESH, refreshToken, {
      ...baseOptions,
      sameSite: 'strict',
      path: '/auth/refresh'
    });
    res.cookie(REFRESH_LOGOUT, refreshToken, {
      ...baseOptions,
      sameSite: 'strict',
      path: '/auth/logout'
    });
  }

  async clearAuthCookies(res: Response, refreshToken: string) {
    if (refreshToken) {
      const token = await this.db.refreshToken.findUnique({
        where: { token: refreshToken }
      });

      if (token) {
        await this.db.refreshToken.update({
          where: { id: token.id },
          data: { revoked: true }
        });
      }
    }

    const baseOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      domain: process.env.NODE_ENV === 'production' ? '.referenceforall.com' : undefined,
      expires: new Date(0)
    };
    res.cookie(AUTHORIZATION, '', {
      ...baseOptions,
      sameSite: 'lax',
      path: '/'
    });
    res.cookie(REFRESH, '', {
      ...baseOptions,
      sameSite: 'strict',
      path: '/auth/refresh'
    });
    res.cookie(REFRESH_LOGOUT, '', {
      ...baseOptions,
      sameSite: 'strict',
      path: '/auth/logout'
    });
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  buildUserPayload(user: User): IUserPayload {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
      name: { familyName: user.familyName, givenName: user.givenName },
      icon: user.icon
    };
  }

  async validateUsername({ username }: ValidateUsernameDto) {
    const user = await this.db.user.findUnique({ where: { username } });
    if (user) {
      throw new CoreException(ErrorCode.USER_ALREADY_EXISTS);
    }

    const isEmail = emailRegex.test(username);
    if (isEmail) {
      await this.verificationService.sendSignupMail(username);
    }
  }

  async verifyEmailWithCode(email: string, verifyCode: string): Promise<void> {
    if (!emailRegex.test(email)) {
      throw new CoreException(ErrorCode.INVALIDATE_EMAIL);
    }

    await this.verificationService.verifyEmailToken({
      token: verifyCode,
      email,
      type: VerificationType.EMAIL_VERIFICATION
    });
  }

  async validateEmail(data: VerifySignupCodeDto) {
    const tokenId = await this.verificationService.verifyEmailToken({
      email: data.email,
      token: data.verify,
      type: VerificationType.EMAIL_VERIFICATION
    });
    await this.verificationService.markTokenAsVerified(tokenId);
  }
}
