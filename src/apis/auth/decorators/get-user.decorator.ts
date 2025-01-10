import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUserPayload } from '@/apis/auth/interfaces';

export const GetUser = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user: IUserPayload | undefined = request.user;

  return data ? user && user[data] : user;
});
