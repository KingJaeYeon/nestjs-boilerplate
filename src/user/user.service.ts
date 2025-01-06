import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    private readonly db: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async createUser(data: SignupDto) {
    const { email, password } = data;

    await this.db.accountDao.throwIfEmailExists(email);
    const hashedPassword = await this.authService.hashPassword(password);

    return this.db.user.create({
      select: { id: true },
      data: {
        account: {
          create: {
            accountId: email,
            secret: hashedPassword,
          },
        },
      },
    });
  }
}
