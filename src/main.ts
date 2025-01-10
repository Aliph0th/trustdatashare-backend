import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { getSessionConfig } from './core/config/session.config';
import { CoreModule } from './core/core.module';
import { RedisService } from './core/redis/redis.service';

async function bootstrap() {
   const app = await NestFactory.create(CoreModule);

   const configService = app.get(ConfigService);

   app.setGlobalPrefix('api');
   app.enableVersioning({ type: VersioningType.URI, defaultVersion: configService.getOrThrow('ACTUAL_VERSION') });
   app.enableCors({ credentials: true, origin: configService.getOrThrow('ALLOWED_ORIGIN') });
   app.useGlobalPipes(new ValidationPipe({ transform: true }));

   app.use(cookieParser(configService.getOrThrow('COOKIE_SECRET')));
   app.use(session(getSessionConfig(configService, app.get(RedisService))));
   await app.listen(configService.getOrThrow('PORT'));
}
bootstrap();
