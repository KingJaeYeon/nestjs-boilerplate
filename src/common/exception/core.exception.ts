import { ErrorCode } from './error.code';
import { HttpStatus } from '@nestjs/common';

export class CoreException extends Error {
  readonly status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
  readonly code: string = 'UNKNOWN_ERROR';
  readonly message: string;

  constructor(
    errorCodeOrMessage: (typeof ErrorCode)[keyof typeof ErrorCode] | string,
    code?: string,
    status?: HttpStatus,
  ) {
    const isMessageObj = typeof errorCodeOrMessage === 'object';
    super(isMessageObj ? errorCodeOrMessage.message : errorCodeOrMessage);

    if (isMessageObj) {
      const { status, message, code } = errorCodeOrMessage;
      this.status = status;
      this.code = code;
      this.message = message;
    } else {
      this.status = status || this.status;
      this.code = code || this.code;
      this.message = errorCodeOrMessage;
    }
  }
}
