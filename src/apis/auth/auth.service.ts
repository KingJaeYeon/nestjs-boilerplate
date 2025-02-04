import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CoreException, ErrorCode } from '@/common/exception';
import { JwtService } from '@nestjs/jwt';
import { CookieOptions, Response } from 'express';
import { AUTHORIZATION, REFRESH } from '@/common/config';
import { LoginDto } from '@/apis/auth/dto';
import { IUserPayload } from '@/apis/auth/interfaces';
import { add } from 'date-fns';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateLocalUser(data: LoginDto): Promise<IUserPayload> {
    const { email, password } = data;
    const user = await this.db.userDao.findByEmailOrThrow(email);
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new CoreException(ErrorCode.INVALID_PASSWORD);
    }

    return {
      id: user.id,
      nickname: user.nickname,
      email: user.email,
      role: user.role,
    };
  }

  async generateTokens(payload: IUserPayload, userAgent: string, ipAddress: string) {
    const accessToken = this.jwtService.sign(
      payload, //
      { expiresIn: '1h' },
    );

    const refreshToken = crypto.randomUUID();

    // db에 refresh token 저장 로직 추가 (선택사항)
    await this.db.refreshToken.create({
      data: {
        token: refreshToken,
        userId: payload.id,
        expiredAt: add(new Date(), { days: 7 }), // 7일 후
        userAgent,
        ipAddress,
      },
    });
    return { accessToken, refreshToken };
  }

  async rotateRefreshToken(refreshToken: string, ipAddress: string, userAgent: string) {
    const storedToken = await this.db.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.revoked || storedToken.expiredAt < new Date()) {
      throw new CoreException(ErrorCode.INVALID_REFRESH);
    }

    await this.db.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    const { user } = storedToken;
    const payload: IUserPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      nickname: user.nickname,
    };

    return this.generateTokens(payload, ipAddress, userAgent);
  }

  setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    const { accessToken, refreshToken } = tokens;

    const baseOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      domain: process.env.NODE_ENV === 'production' ? '.referenceforall.com' : undefined,
    };

    res.cookie(AUTHORIZATION, accessToken, {
      ...baseOptions,
      sameSite: 'lax',
      path: '/',
    });
    res.cookie(REFRESH, refreshToken, {
      ...baseOptions,
      sameSite: 'strict',
      path: '/auth/refresh',
    });
  }

  clearAuthCookies(res: Response) {
    const baseOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      domain: process.env.NODE_ENV === 'production' ? '.referenceforall.com' : undefined,
      expires: new Date(0),
    };

    res.cookie(AUTHORIZATION, '', {
      ...baseOptions,
      sameSite: 'lax',
      path: '/',
    });

    res.cookie(REFRESH, '', {
      ...baseOptions,
      sameSite: 'strict',
      path: '/auth/refresh',
    });
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
