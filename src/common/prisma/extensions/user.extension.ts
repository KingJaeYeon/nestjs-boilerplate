import { PrismaClient, Provider, User } from '@prisma/client';
import { CoreException, ErrorCode } from '@/common/exception';

// UserDao 타입 정의
export interface UserDao {
  findByEmailOrThrow(email: string): Promise<User>;

  findByIdOrThrow(id: string): Promise<User | Error>;

  findByIdentity(provider: Provider, accountId: string): Promise<User | null>;

  throwIfEmailExists(email: string): Promise<void>;

  throwIfUsernameExists(username: string): Promise<void>;
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
    findByIdentity: async (provider: Provider, accountId: string) => {
      const identity = await prisma.identity.findUnique({
        where: { provider_accountId: { provider, accountId } },
        include: { user: true }
      });
      return identity?.user || null;
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
    throwIfUsernameExists: async (username: string) => {
      const result = await prisma.user.findUnique({ where: { username } });
      if (result) {
        throw new CoreException(ErrorCode.USER_ALREADY_EXISTS);
      }
    }
  };
};

// userDao 확장 정의
export const userExtension = (prisma: PrismaClient) => {
  return prisma.$extends({
    client: {
      user: userDaoImpl(prisma)
    }
  });
};
