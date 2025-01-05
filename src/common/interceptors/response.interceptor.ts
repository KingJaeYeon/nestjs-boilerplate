import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ResponseDto } from '../response.dto';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ResponseDto<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ResponseDto<T>> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data: any) => {
        if (data instanceof ResponseDto) {
          response.status(data['status'] || 200);
        }
        return data;
      }),
    );
  }
}
