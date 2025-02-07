import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CoreException, ErrorCode } from '@/common/exception';
import { JwtService } from '@nestjs/jwt';
import { CookieOptions, Response } from 'express';
import { AUTHORIZATION, REFRESH } from '@/common/config';
import { LoginDto } from '@/apis/auth/dto';
import { IUserPayload, IOAuth, IVerifyToken } from '@/apis/auth/interfaces';
import { add } from 'date-fns';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly db: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateLocalUser(data: LoginDto): Promise<IUserPayload> {
    const { username, password } = data;
    const accessId = username.includes('@') ? { email: username } : { username };
    const user = await this.db.user.findUnique({
      where: accessId,
    });

    if (!user) {
      throw new CoreException(ErrorCode.USER_NOT_FOUND);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new CoreException(ErrorCode.INVALID_PASSWORD);
    }

    return {
      id: user.id,
      displayName: user.displayName,
      name: { familyName: user.familyName, givenName: user.givenName },
      icon: user.icon,
      email: user.email,
      role: user.role,
    };
  }

  async findOrCreateOAuthUser(data: IOAuth) {
    const result: Partial<IUserPayload> = {};
    const identity = await this.db.identity.findUnique({
      where: {
        provider_accountId: {
          provider: data.provider,
          accountId: data.id,
        },
      },
      include: { user: true },
    });

    result.id = identity.user.id;
    result.email = identity.email;
    result.role = identity.user.role;
    result.displayName = identity.user.displayName;
    result.name = { familyName: identity.user.familyName, givenName: identity.user.givenName };
    result.icon = identity.user.icon;

    const isNewProvider = !identity;
    if (isNewProvider) {
      const user = await this.db.user.findUnique({
        where: { email: data.email },
      });
      result.id = user.id;
      result.email = user.email;
      result.role = user.role;
      result.displayName = user.displayName;
      result.name = { familyName: user.familyName, givenName: user.givenName };
      result.icon = user.icon;

      const isNewUser = !user;
      if (isNewUser) {
        const newUser = await this.db.user.create({
          data: {
            username: data.email,
            email: data.email,
            displayName: data.displayName,
            familyName: data.name.familyName,
            givenName: data.name.givenName,
            icon: data.icon,
            role: UserRole.USER,
            identity: {
              create: {
                email: data.email,
                accountId: data.id,
                provider: data.provider,
              },
            },
          },
        });
        result.id = newUser.id;
        result.email = newUser.email;
        result.role = newUser.role;
        result.displayName = newUser.displayName;
        result.name = { familyName: newUser.familyName, givenName: newUser.givenName };
        result.icon = newUser.icon;
      }
      await this.db.identity.create({
        data: {
          email: data.email,
          accountId: data.id,
          provider: data.provider,
          userId: user.id,
        },
      });
    }
    return result;
  }

  async generateTokens(payload: IUserPayload, userAgent: string, ipAddress: string) {
    const accessToken = this.jwtService.sign(
      payload, //
      { expiresIn: '5s' },
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

    if (!storedToken) {
      throw new CoreException(ErrorCode.INVALID_REFRESH);
    }

    const invalidToken = storedToken.revoked || storedToken.expiredAt < new Date();
    if (invalidToken) {
      await this.db.refreshToken
        .delete({
          where: { id: storedToken.id },
        })
        .then((r) => console.log('>> invalidToken:: delete', r.id));
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
      displayName: user.displayName,
      name: { familyName: user.familyName, givenName: user.givenName },
      icon: user.icon,
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

  async verifiedToken(data: IVerifyToken): Promise<boolean | Error> {
    const { authCode, email, type, userId } = data;
    if (authCode === undefined) {
      console.log('authCode is undefined');
      throw new CoreException(ErrorCode.INVALID_TOKEN);
    }

    const token = await this.db.verification.findFirst({
      where: { token: authCode, email, type, userId, verified: false },
    });
    if (!token) {
      throw new CoreException(ErrorCode.INVALID_TOKEN);
    }

    const invalidToken = token.expiredAt < new Date();
    if (invalidToken) {
      throw new CoreException(ErrorCode.TOKEN_EXPIRED);
    }

    return true;
  }
}
