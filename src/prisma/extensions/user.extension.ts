import { PrismaClient, User } from '@prisma/client';

// UserDao 타입 정의
export interface UserDao {
  findById(id: string): Promise<User | null>;
}

const userDaoImpl = (prisma: PrismaClient): UserDao => {
  return {
    findById: async (id: string) => {
      return prisma.user.findUnique({
        where: { id },
      });
    },
  };
};

// userDao 확장 정의
export const userExtension = (prisma: PrismaClient) => {
  return prisma.$extends({
    client: {
      user: userDaoImpl(prisma),
    },
  });
};
