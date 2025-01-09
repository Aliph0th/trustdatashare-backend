import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis {
   constructor(private readonly configService: ConfigService) {
      super(configService.getOrThrow('REDIS_URI'));
   }
}
