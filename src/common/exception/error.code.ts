import { HttpStatus } from '@nestjs/common';

export interface IErrorCode {
  code: string;
  message: string;
  status: HttpStatus;
}

const createErrorCode = (code: string, message: string, status: HttpStatus): IErrorCode => ({
  code,
  message,
  status,
});

export class ErrorCode {
  static NOT_FOUND = createErrorCode('COMMON-001', 'error.common.not_found', HttpStatus.NOT_FOUND);

  static USER_NOT_FOUND = createErrorCode('USER-001', 'error.user.not_found', HttpStatus.NOT_FOUND);
  static USER_ALREADY_EXISTS = createErrorCode('USER-002', 'error.user.already_exists', HttpStatus.CONFLICT);
  static EMAIL_DUPLICATED = createErrorCode('USER-003', 'error.user.email_duplicated', HttpStatus.CONFLICT);

  static FORBIDDEN = createErrorCode('AUTH-001', 'error.auth.forbidden', HttpStatus.FORBIDDEN);
  static INVALID_PASSWORD = createErrorCode('AUTH-002', 'error.auth.invalid_password', HttpStatus.BAD_REQUEST);
  static INVALIDATE_USERNAME = createErrorCode('AUTH-003', 'error.auth.invalid_username', HttpStatus.BAD_REQUEST);

  static INVALID_ACCESS = createErrorCode('TOKEN-001', 'error.token.invalid_access', HttpStatus.UNAUTHORIZED);
  static INVALID_REFRESH: IErrorCode = createErrorCode('TOKEN-002', 'error.token.invalid_refresh', HttpStatus.UNAUTHORIZED);
  static INVALID_TOKEN: IErrorCode = createErrorCode('TOKEN-003', 'error.token.invalid', HttpStatus.BAD_REQUEST);
  static TOKEN_EXPIRED: IErrorCode = createErrorCode('TOKEN-004', 'error.token.expired', HttpStatus.BAD_REQUEST);

  static INVALIDATE_PASSWORD = createErrorCode('VALIDATE-001', 'error.auth.invalid_password', HttpStatus.BAD_REQUEST);
}
