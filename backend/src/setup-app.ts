import { INestApplication, ValidationPipe } from '@nestjs/common';

/** Global pipes shared by main.ts and e2e tests. */
export function setupApp(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableShutdownHooks();
}
