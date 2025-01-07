import { Account, PrismaClient, User } from '@prisma/client';
import { CoreException, ErrorCode } from '@/common/exception';

// UserDao 타입 정의
export interface AccountDao {
  findByEmailOrThrow(email: string): Promise<Account & { user: User }>;
  throwIfEmailExists(email: string): Promise<void>;
}

const accountDaoImpl = (prisma: PrismaClient): AccountDao => {
  return {
    findByEmailOrThrow: async (email: string) => {
      const account = await prisma.account.findFirst({
        where: { accountId: email },
        include: { user: true },
      });
      if (!account) {
        throw new CoreException(ErrorCode.USER_NOT_FOUND);
      }
      return account;
    },
    throwIfEmailExists: async (email: string) => {
      const result = await prisma.account.findFirst({
        where: { accountId: email },
      });
      if (result) {
        throw new CoreException(ErrorCode.USER_ALREADY_EXISTS);
      }
    },
  };
};

// userDao 확장 정의
export const accountExtension = (prisma: PrismaClient) => {
  return prisma.$extends({
    client: {
      account: accountDaoImpl(prisma),
    },
  });
};
