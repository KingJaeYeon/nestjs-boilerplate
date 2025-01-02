import { ErrorCode } from './error.code';
import { HttpStatus } from '@nestjs/common';

export class CoreException extends Error {
  readonly status: HttpStatus;
  readonly code: string;
  readonly errorMessage: string;

  constructor(errorCode: (typeof ErrorCode)[keyof typeof ErrorCode]) {
    super(errorCode.message);
    this.status = errorCode.status;
    this.code = errorCode.code;
    this.errorMessage = errorCode.message;
  }
}
