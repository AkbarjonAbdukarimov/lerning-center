import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { resolveClientDir } from './config';
import { setupApp } from './setup-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  setupApp(app);

  const corsOrigin = config.get<string>('CORS_ORIGIN');
  if (corsOrigin) app.enableCors({ origin: corsOrigin.split(',') });

  const swagger = new DocumentBuilder()
    .setTitle('Training center payments API')
    .setDescription('Students, payments and monthly debtors')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swagger));

  const port = config.get<number>('PORT', 3000);
  await app.listen(port, '0.0.0.0');

  const logger = new Logger('Bootstrap');
  logger.log(`API listening on http://localhost:${port} (Swagger: /docs)`);
  logger.log(resolveClientDir() ? 'Serving React app from /' : 'React build not found — UI not served (dev mode)');
}

bootstrap();
