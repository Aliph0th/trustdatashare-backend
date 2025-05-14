import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_KEYS } from '#/constants';

@Injectable()
export class RedisService extends Redis {
   constructor(private readonly configService: ConfigService) {
      super(configService.getOrThrow('REDIS_URI'));
   }

   async requestCount(id: string) {
      const count = await this.get(REDIS_KEYS.REQUEST_COUNT(id));
      return +count || 0;
   }
   async incrementCount(id: string, expiresIn: number) {
      const key = REDIS_KEYS.REQUEST_COUNT(id);
      const [[_, count]] = await this.multi().incr(key).expire(key, expiresIn, 'NX').exec();
      return count as number;
   }
   async putResource(id: string, payload: string | number, expiresIn: number) {
      await this.set(REDIS_KEYS.RESOURCE(id), payload, 'EX', expiresIn, 'NX');
   }
   async getResource(id: string) {
      return await this.get(REDIS_KEYS.RESOURCE(id));
   }

   async invalidate(path: string) {
      const [[_, resource], [__, requests]] = await this.multi()
         .keys(`${REDIS_KEYS.RESOURCE(path)}*`)
         .keys(`${REDIS_KEYS.REQUEST_COUNT(path)}*`)
         .exec();
      const keys = [...(resource as string[]), ...(requests as string[])];
      if (keys.length > 0) {
         await this.del(...keys);
      }
   }
}
