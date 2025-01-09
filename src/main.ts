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

   app.use(cookieParser(configService.getOrThrow('COOKIE_SECRET')));
   app.use(session(getSessionConfig(configService, app.get(RedisService))));

   await app.listen(configService.getOrThrow('PORT'));
}
bootstrap();
