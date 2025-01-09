import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '@/apis/auth/decorators';
import { CoreException, ErrorCode } from '@/common/exception';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!matchRoles(roles, user?.roles)) {
      throw new CoreException(ErrorCode.FORBIDDEN);
    }
    return true;
  }
}

function matchRoles(requiredRoles: string[], userRoles: string[] = []): boolean {
  return requiredRoles.some((role) => userRoles.includes(role));
}
