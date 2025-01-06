import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { CoreException } from '../exception';
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
    };

    if (exception instanceof CoreException) {
      response.status(exception.status).json({
        ...exception,
        ...base,
        message: exception.message,
      });
    } else {
      response.status(500).json({
        ...base,
        status: 500,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal Server Error',
      });
    }
  }
}
