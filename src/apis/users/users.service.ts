import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { SignupDto } from './dto';
import { AuthService } from '../auth/auth.service';
import { Provider } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly db: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async createUser(data: SignupDto) {
    const { email, password } = data;

    await this.db.userDao.throwIfEmailExists(email);
    const hashedPassword = await this.authService.hashPassword(password);

    return this.db.user.create({
      select: { id: true },
      data: {
        email,
        password: hashedPassword,
        identity: {
          create: {
            accountId: email,
            email,
            provider: Provider.LOCAL,
          },
        },
      },
    });
  }
}
