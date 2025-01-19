import { HttpStatus } from '@nestjs/common';

export interface IErrorCode {
  code: string;
  message: string;
  status: HttpStatus;
}

export class ErrorCode {
  static NOT_FOUND: IErrorCode = {
    status: HttpStatus.NOT_FOUND,
    code: 'CODE-001',
    message: 'not found',
  };

  static USER_NOT_FOUND: IErrorCode = {
    status: HttpStatus.NOT_FOUND,
    code: 'USER-001',
    message: 'user not found',
  };

  static USER_ALREADY_EXISTS: IErrorCode = {
    status: HttpStatus.CONFLICT,
    code: 'USER-002',
    message: 'user already exists',
  };

  static EMAIL_DUPLICATED: IErrorCode = {
    status: HttpStatus.CONFLICT,
    code: 'USER-002',
    message: 'email duplicated',
  };

  static FORBIDDEN: IErrorCode = {
    status: HttpStatus.FORBIDDEN,
    code: 'AUTH-403',
    message: 'insufficient permissions',
  };

  static INVALID_PASSWORD: IErrorCode = {
    status: HttpStatus.BAD_REQUEST,
    code: 'AUTH-001',
    message: 'invalid password',
  };

  static INVALID_ACCESS: IErrorCode = {
    status: HttpStatus.UNAUTHORIZED,
    code: 'AUTH-002',
    message: 'access token invalid',
  };

  static INVALID_REFRESH: IErrorCode = {
    status: HttpStatus.UNAUTHORIZED,
    code: 'AUTH-003',
    message: 'refresh token invalid',
  };

  static INVALID_TOKEN: IErrorCode = {
    status: HttpStatus.BAD_REQUEST,
    code: 'AUTH-004',
    message: 'token invalid',
  };

  static TOKEN_EXPIRED: IErrorCode = {
    status: HttpStatus.BAD_REQUEST,
    code: 'AUTH-005',
    message: 'token expired',
  };
}
