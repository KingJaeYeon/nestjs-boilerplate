import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { CoreException } from '../exception/core.exception';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    if (exception instanceof CoreException) {
      response.status(exception.status).json({
        ...exception,
        requestUrl: request.url,
      });
    } else {
      response.status(500).json({
        status: 500,
        code: 'INTERNAL_SERVER_ERROR',
        errorMessage: 'Internal Server Error',
        requestUrl: request.url,
      });
    }
  }
}
