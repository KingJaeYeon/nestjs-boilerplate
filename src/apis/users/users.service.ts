import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { SignupDto } from './dto';
import { AuthService } from '../auth/auth.service';
import { Provider, VerificationType } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly db: PrismaService,
    private readonly authService: AuthService,
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
        type: VerificationType.EMAIL_VERIFICATION,
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
              email: username,
            },
          },
        },
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
            provider: Provider.LOCAL,
          },
        },
      },
    });
  }
}
