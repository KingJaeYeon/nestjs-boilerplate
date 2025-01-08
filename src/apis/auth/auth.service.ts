import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CoreException, ErrorCode } from '@/common/exception';
import { JwtService } from '@nestjs/jwt';
import { CookieOptions, Response } from 'express';
import { AUTHORIZATION, REFRESH } from '@/common/constants';
import { LoginDto } from '@/apis/auth/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateLocalUser(data: LoginDto) {
    const { email, password } = data;

    const { user, ...account } = await this.db.accountDao.findByEmailOrThrow(email);
    const isValidPassword = await bcrypt.compare(password, account.secret);
    if (!isValidPassword) {
      throw new CoreException(ErrorCode.USER_INVALID_PASSWORD);
    }
    return user;
  }

  async generateToken({ userId }: { userId: string }) {
    const access = this.jwtService.sign(
      { userId }, //
      { expiresIn: '1h' },
    );

    const random = Math.random().toString(36).slice(2, 13);
    const refresh = this.jwtService.sign(
      { random }, //
      { expiresIn: '7d' },
    );

    // db에 refresh token 저장 로직 추가 (선택사항)
    return { access, refresh };
  }

  setAuthCookies(res: Response, tokens: { access: string; refresh: string }) {
    const { access, refresh } = tokens;

    const baseOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      domain: process.env.NODE_ENV === 'production' ? '.referenceforall.com' : undefined,
    };

    res.cookie(AUTHORIZATION, access, {
      ...baseOptions,
      sameSite: 'lax',
      path: '/',
    });
    res.cookie(REFRESH, refresh, {
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
