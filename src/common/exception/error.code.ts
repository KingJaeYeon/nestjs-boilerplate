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
    message: 'User not found',
  };

  static USER_ALREADY_EXISTS: IErrorCode = {
    status: HttpStatus.CONFLICT,
    code: 'USER-002',
    message: 'User already exists',
  };

  static USER_INVALID_PASSWORD: IErrorCode = {
    status: HttpStatus.BAD_REQUEST,
    code: 'USER-003',
    message: 'Invalid password',
  };
}

// export const ErrorCode: { [key: string]: IErrorCode } = {
//   USER_NOT_FOUND: {
//     status: HttpStatus.NOT_FOUND,
//     code: 'USER-001',
//     message: 'User not found',
//   },
//   USER_ALREADY_EXISTS: {
//     status: HttpStatus.CONFLICT,
//     code: 'USER-002',
//     message: 'User already exists',
//   },
//   USER_INVALID_PASSWORD: {
//     status: HttpStatus.BAD_REQUEST,
//     code: 'USER-003',
//     message: 'Invalid password',
//   },
// };
