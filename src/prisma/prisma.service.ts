import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AccountDao, accountExtension, UserDao, userExtension } from './extensions';

@Injectable()
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
