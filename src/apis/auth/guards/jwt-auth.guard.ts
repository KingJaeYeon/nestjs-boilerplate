import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@/apis/auth/decorators';
import { AUTHORIZATION } from '@/common/config';
import { CoreException, ErrorCode } from '@/common/exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard(AUTHORIZATION) {
  constructor(private reflector: Reflector) {
    super();
  }

  // 1.
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (isPublic) return true;

    return super.canActivate(context);
  }

  // 2.
  handleRequest(err, user) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw new CoreException(ErrorCode.INVALID_ACCESS);
    }
    return user;
  }
}
