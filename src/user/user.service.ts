import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Provider } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly db: PrismaService) {}

  async createUser() {
    const user = await this.db.userDao.findByIdOrThrow('cm5ahxxle0000ad09p74d7ix81');
    console.log('userDao:', user);
    // const account = await this.db.accountDao.findByEmailOrThrow('cm5ahxxle0000ad09p74d7ix8', Provider.LOCAL);
    // console.log(account);
    return user;
  }
}
