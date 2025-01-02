import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UserDao, userExtension } from './extensions/user.extension';
import { AccountDao, accountExtension } from './extensions/account.extension';

// 모든 DAO 확장 결합
const allExtensions = [userExtension, accountExtension];

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  userDao: UserDao;
  accountDao: AccountDao;

  constructor() {
    super();
    const client = userExtension(this);
    this.userDao = client.user;
    //     this.accountDao = client.accountDao;
  }

  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
