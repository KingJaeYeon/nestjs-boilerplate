import { HttpStatus } from '@nestjs/common';
import { IErrorCode } from './error.code';

export class CoreException extends Error {
  readonly status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
  readonly code: string = 'UNKNOWN_ERROR';
  readonly message: string;

  constructor(errorCodeOrMessage: IErrorCode | string, code?: string, status?: HttpStatus) {
    const isMessageStr = typeof errorCodeOrMessage === 'string';
    super(isMessageStr ? errorCodeOrMessage : errorCodeOrMessage.message);

    if (isMessageStr) {
      this.status = status || this.status;
      this.code = code || this.code;
      this.message = errorCodeOrMessage;
    } else {
      const { status, message, code } = errorCodeOrMessage;
      this.status = status;
      this.code = code;
      this.message = message;
    }
  }
}
