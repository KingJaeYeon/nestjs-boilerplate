import { PrismaClient, User } from '@prisma/client';
import { CoreException, ErrorCode } from '@/common/exception';

// UserDao 타입 정의
export interface UserDao {
  findByIdOrThrow(id: string): Promise<User | Error>;

  findByEmailOrThrow(email: string): Promise<User>;

  throwIfEmailExists(email: string): Promise<void>;
}

const userDaoImpl = (prisma: PrismaClient): UserDao => {
  return {
    findByIdOrThrow: async (id: string) => {
      const result = await prisma.user.findUniqueOrThrow({ where: { id } });
      if (!result) {
        throw new CoreException(ErrorCode.USER_NOT_FOUND);
      }
      return result;
    },
    findByEmailOrThrow: async (email: string) => {
      const result = await prisma.user.findUniqueOrThrow({ where: { email } });
      if (!result) {
        throw new CoreException(ErrorCode.USER_NOT_FOUND);
      }
      return result;
    },
    throwIfEmailExists: async (email: string) => {
      const result = await prisma.user.findUnique({ where: { email } });
      if (result) {
        throw new CoreException(ErrorCode.EMAIL_DUPLICATED);
      }
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
