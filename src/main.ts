import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import helmet from 'helmet';
import * as passport from 'passport';
import { AuthenticatedGuard } from '../libs/common/src/guards';
import { getSessionConfig } from './core/config/session.config';
import { CoreModule } from './core/core.module';
import { RedisService } from './core/redis/redis.service';

async function bootstrap() {
   const app = await NestFactory.create(CoreModule);

   const configService = app.get(ConfigService);
   const reflector = app.get(Reflector);

   app.setGlobalPrefix(configService.get('API_PREFIX') || '');
   app.enableVersioning({ type: VersioningType.URI, defaultVersion: configService.getOrThrow('ACTUAL_VERSION') });
   app.enableCors({ credentials: true, origin: configService.getOrThrow('ALLOWED_ORIGIN') });
   app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, stopAtFirstError: true }));
   app.useGlobalGuards(new AuthenticatedGuard(reflector));

   app.use(helmet());
   app.use(cookieParser(configService.getOrThrow('COOKIE_SECRET')));
   app.use(session(getSessionConfig(configService, app.get(RedisService))));
   app.use(passport.initialize());
   app.use(passport.session());

   await app.listen(configService.getOrThrow('PORT'));
}
bootstrap();
