import { Account, PrismaClient, Provider } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';
import { CoreException, ErrorCode } from '../../exception';

// UserDao 타입 정의
export interface AccountDao {
  findByEmailOrThrow(userId: string, provider: Provider): Promise<Account | Error>;
  throwIfEmailExists(email: string): Promise<void | Error>;
}

const accountDaoImpl = (prisma: PrismaClient): AccountDao => {
  return {
    findByEmailOrThrow: async (userId: string, provider: Provider) => {
      const result = await prisma.account.findUnique({
        where: {
          userId_provider: {
            userId,
            provider,
          },
        },
      });
      if (!result) {
        throw new BadRequestException('Account not found');
      }
      return result;
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
