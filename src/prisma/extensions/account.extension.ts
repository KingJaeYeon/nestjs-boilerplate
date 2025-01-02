import { Account, PrismaClient, Provider } from '@prisma/client';

// UserDao 타입 정의
export interface AccountDao {
  findByEmail(userId: string, provider: Provider): Promise<Account | null>;
}

const accountDaoImpl = (prisma: PrismaClient): AccountDao => {
  return {
    findByEmail: async (userId: string, provider: Provider) => {
      return prisma.account.findUnique({
        where: {
          userId_provider: {
            userId,
            provider,
          },
        },
      });
    },
  };
};

// userDao 확장 정의
export const accountExtension = (prisma: PrismaClient) => {
  return prisma.$extends({
    client: {
      user: accountDaoImpl(prisma),
    },
  });
};
