import { HttpStatus } from '@nestjs/common';

export interface IErrorCode {
  code: string;
  message: string;
  status: HttpStatus;
}

export class ErrorCode {
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

  static USER_INVALID_PASSWORD: IErrorCode = {
    status: HttpStatus.BAD_REQUEST,
    code: 'USER-003',
    message: 'invalid password',
  };
}
