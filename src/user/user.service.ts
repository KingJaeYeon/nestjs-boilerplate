import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly db: PrismaService) {}

  async createUser() {
    console.dir('createUser', this.db.userDao);
    console.dir('user', this.db.user);
    const user = await this.db.userDao.findById('cm5ahxxle0000ad09p74d7ix8');
    console.log('user', user);
    return 'createUser';
  }
}
