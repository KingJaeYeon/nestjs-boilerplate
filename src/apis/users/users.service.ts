import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { SignupDto } from './dto';
import { AuthService } from '../auth/auth.service';
import { Prisma, Provider, UserRole } from '@prisma/client';
import { IOAuth, IUserPayload } from '@/apis/auth/interfaces';
import { CoreException, ErrorCode } from '@/common/exception';

@Injectable()
export class UsersService {
  constructor(
    private readonly db: PrismaService,
    private readonly authService: AuthService
  ) {}

  async createUser(data: SignupDto) {
    const { type, username, password, verifyCode, displayName = '' } = data;

    await this.throwIfUserExists({ where: { username } });

    if (data.type === 'email') {
      await this.authService.verifyEmailWithCode(username, verifyCode);
    }

    const hashedPwd = await this.authService.hashPassword(password);
    return this.db.user.create({
      data: {
        username,
        ...(type === 'email' && { email: username }),
        password: hashedPwd,
        displayName,
        identity: {
          create: {
            accountId: username,
            provider: Provider.LOCAL,
            ...(type === 'email' && { email: username })
          }
        }
      }
    });
  }

  async findOrCreateOAuthUser(data: IOAuth): Promise<IUserPayload> {
    // 1. 기존  "OAuth identity"로 사용자 찾기
    let user = await this.db.userDao.findByIdentity(data.provider, data.id);

    if (user) {
      return this.authService.buildUserPayload(user);
    }

    // 2. 기존 이메일 계정 찾기
    user = await this.db.user.findUnique({
      where: { email: data.email }
    });

    // 3. 이메일 없으면 새로운 계정 생성
    if (!user) {
      user = await this.db.user.create({
        data: {
          username: data.email,
          email: data.email,
          displayName: data.displayName,
          familyName: data.name.familyName,
          givenName: data.name.givenName,
          icon: data.icon,
          role: UserRole.USER
        }
      });
    }

    // 4. OAuth identity 생성
    await this.db.identity.create({
      data: {
        email: data.email,
        accountId: data.id,
        provider: data.provider,
        userId: user.id
      }
    });

    return this.authService.buildUserPayload(user);
  }

  private async throwIfUserExists(args: Prisma.UserFindUniqueArgs): Promise<void> {
    const user = await this.db.user.findUnique(args);
    if (user) {
      throw new CoreException(ErrorCode.USER_ALREADY_EXISTS);
    }
  }
}
