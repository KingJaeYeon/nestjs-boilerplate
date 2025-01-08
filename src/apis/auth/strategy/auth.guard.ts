import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

export const CustomAuthGuard = (name: 'local' | 'jwt') => {
  return class extends AuthGuard(name) {
    // canActivate(context: ExecutionContext) {
    //   const ctx = context.switchToHttp();
    //   const req = ctx.getRequest(); // Express request 객체
    //   console.log('Express req:', req);
    //
    //   return super.canActivate(context);
    // }
  };
};
