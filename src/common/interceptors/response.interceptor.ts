import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ResponseDto } from '@/common/response.dto';
import { map, Observable } from 'rxjs';

// NestJS는 기본적으로 return 키워드로 데이터를 반환하고, 이를 "Interceptor"에서 가로채어 응답한다.
// @Res()를 사용하면 NestJS의 기본 응답 흐름을 벗어나므로 "Interceptor"가 동작하지 않아서 알아서 처리해야한다.
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
