import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { CoreException } from '@/common/exception';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const base = {
      timestamp: new Date().toISOString(),
      path: request.url,
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal Server Error',
    };

    if (exception instanceof CoreException) {
      base['status'] = exception.status;
      base['code'] = exception.code;
      base['message'] = exception.message;
    }

    response.status(base.status).json(base);
  }
}
