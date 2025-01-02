import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UserDao, userExtension } from './extensions/user.extension';
import { AccountDao, accountExtension } from './extensions/account.extension';
import { PrismaExtensions } from '../decorators/prisma-extensions.decorator';

// 모든 DAO 확장 결합
const allExtensions = [userExtension, accountExtension];

@Injectable()
@PrismaExtensions(allExtensions)
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  userDao: UserDao;
  accountDao: AccountDao;

  constructor() {
    super();
    this.userDao = userExtension(this).user;
    this.accountDao = accountExtension(this).account;
  }

  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
