import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    // origin: 'http://localhost:5173', // your Vite dev URL
    // origin: 'https://syntech-hackathon.vercel.app', // your Vite dev URL
    origin: '*', // your Vite dev URL
    credentials: true,
  });

  app.setGlobalPrefix('api');
  // app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}
bootstrap();
