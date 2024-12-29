import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    const a = 5234234 + 123892183982319389231 + 4873198729817398712897398723198 + 3128737289;
    return `Hello World!`;
  }
}
