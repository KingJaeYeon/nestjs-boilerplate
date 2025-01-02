import { ErrorCode } from './error.code';
import { HttpStatus } from '@nestjs/common';

export class CoreException extends Error {
  readonly status: HttpStatus;
  readonly code: string;
  readonly errorMessage: string;

  constructor(
    errorCodeOrMessage: (typeof ErrorCode)[keyof typeof ErrorCode] | string,
    code?: string,
    status?: HttpStatus,
  ) {
    if (typeof errorCodeOrMessage === 'object') {
      super(errorCodeOrMessage.message);
      this.status = errorCodeOrMessage.status;
      this.code = errorCodeOrMessage.code;
      this.errorMessage = errorCodeOrMessage.message;
    } else {
      super(errorCodeOrMessage);
      this.status = status || HttpStatus.INTERNAL_SERVER_ERROR;
      this.code = code || 'UNKNOWN_ERROR';
      this.errorMessage = errorCodeOrMessage;
    }
  }
}
