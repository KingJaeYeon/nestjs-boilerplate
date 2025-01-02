import { HttpStatus } from '@nestjs/common';

interface IErrorCode {
  code: string;
  message: string;
  status: HttpStatus;
}

export const ErrorCode: { [key: string]: IErrorCode } = {
  USER_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    code: 'USER-001',
    message: 'User not found',
  },
};
