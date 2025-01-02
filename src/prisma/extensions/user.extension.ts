import { PrismaClient, User } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

// UserDao 타입 정의
export interface UserDao {
  findByIdOrThrow(id: string): Promise<User | Error>;
}

const userDaoImpl = (prisma: PrismaClient): UserDao => {
  return {
    findByIdOrThrow: async (id: string) => {
      const result = await prisma.user.findUnique({
        where: { id },
      });

      if (!result) {
        throw new BadRequestException('User not found');
      }

      return result;
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
