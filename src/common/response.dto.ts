import { HttpStatus } from '@nestjs/common';

export class ResponseDto<T> {
  constructor(
    private readonly status: HttpStatus,
    private readonly message: string,
    private readonly data?: T,
  ) {}

  static success<T>(data: T, message = 'ok', status: HttpStatus = 200): ResponseDto<T> {
    return new ResponseDto<T>(status, message, data);
  }

  static builder<T>() {
    // Builder 클래스를 내부에 숨김 (클로저 방식)
    class Builder {
      public status: number = 200;
      public message: string = 'ok';
      public data?: T;

      setStatus(status: number): this {
        this.status = status;
        return this;
      }

      setMessage(message: string): this {
        this.message = message;
        return this;
      }

      setData(data: T): this {
        this.data = data;
        return this;
      }

      build(): ResponseDto<T> {
        return new ResponseDto<T>(this.status, this.message, this.data);
      }
    }

    // Builder 인스턴스 반환
    return new Builder();
  }
}
