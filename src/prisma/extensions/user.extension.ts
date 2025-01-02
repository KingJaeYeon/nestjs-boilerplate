import { PrismaClient, User } from '@prisma/client';
import { CoreException } from '../../common/exception/core.exception';
import { ErrorCode } from '../../common/exception/error.code';

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
        throw new CoreException(ErrorCode.USER_NOT_FOUND);
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
