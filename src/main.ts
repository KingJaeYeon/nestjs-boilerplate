import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionInterceptor } from './common/interceptors/http-exception.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionInterceptor());
  await app.listen(process.env.PORT ?? 7777);
}

bootstrap();
