import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { SignupDto } from './dto';
import { AuthService } from '../auth/auth.service';
import { Provider, UserRole, VerificationType } from '@prisma/client';
import { IOAuth, IUserPayload } from '@/apis/auth/interfaces';

@Injectable()
export class UsersService {
  constructor(
    private readonly db: PrismaService,
    private readonly authService: AuthService
  ) {}

  async createUser(data: SignupDto) {
    const { username, password, verifyCode } = data;

    await this.db.userDao.throwIfUsernameExists(username);
    const hashedPwd = await this.authService.hashPassword(password);

    // "username"이 이메일인 경우
    const isEmail = username.includes('@');
    if (isEmail) {
      await this.authService.verifiedToken({
        authCode: verifyCode,
        email: username,
        type: VerificationType.EMAIL_VERIFICATION
      });

      return this.db.user.create({
        select: { id: true },
        data: {
          username,
          email: username,
          password: hashedPwd,
          identity: {
            create: {
              accountId: username,
              provider: Provider.LOCAL,
              email: username
            }
          }
        }
      });
    }

    // "username" 일반 아이디인 경우
    return this.db.user.create({
      select: { id: true },
      data: {
        username,
        password: hashedPwd,
        identity: {
          create: {
            accountId: username,
            provider: Provider.LOCAL
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
}
