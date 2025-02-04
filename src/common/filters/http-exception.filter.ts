import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { CoreException, ErrorCode } from '@/common/exception';
import { Request, Response } from 'express';

interface IException {
  status: number;
  code: string;
  message: string;
  timestamp: string;
  path: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const validateError = ErrorCode[exception?.response?.message];

    const base: IException = {
      timestamp: new Date().toISOString(),
      path: request.url,
      status: exception?.status || 400,
      code: exception?.response?.message || 'INTERNAL_SERVER_ERROR',
      message: exception?.response?.message || 'Internal Server Error',
    };
    console.log(exception);
    if (validateError) {
      base['code'] = validateError.code;
      base['message'] = validateError.message;
      base['status'] = validateError.status;
    }

    if (exception instanceof CoreException) {
      base['status'] = exception.status;
      base['code'] = exception.code;
      base['message'] = exception.message;
    }

    response.status(base.status).json(base);
  }
}
