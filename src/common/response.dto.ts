export class ResponseDto<T> {
  status: number;
  message: string;
  data: T | null;

  constructor(status: number, message: string, data?: T) {
    this.status = status;
    this.message = message;
    this.data = data ?? null;
  }

  static success<T>(data: T, message = 'ok', status = 200): ResponseDto<T> {
    return new ResponseDto<T>(status, message, data);
  }

  static builder() {
    // Builder 클래스를 내부에 숨김 (클로저 방식)
    class Builder<T> {
      public status: number = 200;
      public message: string = 'ok';
      public data: T | null = null;

      constructor(Data?: T) {
        this.data = Data ?? null;
      }

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
