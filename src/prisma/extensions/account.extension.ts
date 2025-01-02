import { Account, PrismaClient, Provider } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

// UserDao 타입 정의
export interface AccountDao {
  findByEmailOrThrow(userId: string, provider: Provider): Promise<Account | Error>;
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
