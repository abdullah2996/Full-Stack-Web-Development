import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // lets the HTML pages (Live Server etc.) call this API
  await app.listen(3000);
  console.log('Nila Bazaar API running on http://localhost:3000');
}
bootstrap();
