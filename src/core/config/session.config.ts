import { ConfigService } from '@nestjs/config';
import { RedisStore } from 'connect-redis';
import { SessionOptions } from 'express-session';
import { RedisService } from '../redis/redis.service';

export const getSessionConfig = (config: ConfigService, redis: RedisService): SessionOptions => ({
   secret: config.getOrThrow('SESSION_SECRET'),
   cookie: {
      secure: !!config.get('SESSION_SECURE'),
      sameSite: config.getOrThrow('COOKIE_SAMESITE'),
      httpOnly: true,
      domain: config.getOrThrow('SESSION_DOMAIN'),
      maxAge: +config.getOrThrow('SESSION_MAX_AGE')
   },
   saveUninitialized: false,
   resave: false,
   name: config.getOrThrow('SESSION_NAME'),
   store: new RedisStore({
      prefix: config.getOrThrow('REDIS_STORE_PREFIX'),
      client: redis
   })
});
