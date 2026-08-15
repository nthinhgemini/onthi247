import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const origins = (process.env.FRONTEND_URL ?? 'http://localhost:3000')
    .split(',')
    .map((o) =>
      o
        .trim()
        .replace(/^["']|["']$/g, '')
        .replace(/\/+$/, ''),
    )
    .filter(Boolean);
  app.enableCors({
    origin: origins,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const port = process.env.PORT ?? 3001;

  const adapter = app.getHttpAdapter();
  adapter.get('/health', (_req: unknown, res: { json: (b: object) => void }) =>
    res.json({ status: 'ok' }),
  );

  await app.listen(port);
}
void bootstrap();
