import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '$/core/redis/redis.service';
import { instanceToPlain } from 'class-transformer';
import type { Request } from 'express';
import { Observable, of, tap } from 'rxjs';
import { METADATA } from '../constants';
import { CacheMetadata } from '../types';
import { buildCacheKey } from '../utils';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
   constructor(
      private readonly redis: RedisService,
      private readonly reflector: Reflector
   ) {}

   async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      const { path, query, body, user } = context.switchToHttp().getRequest<Request>();
      const { threshold, ttl, userSensitive } = this.reflector.get<CacheMetadata>(
         METADATA.CACHED,
         context.getHandler()
      );
      const key = buildCacheKey({ path, query, body, userID: userSensitive ? user?.id : null });
      const count = await this.redis.incrementCount(key, ttl);

      if (count > threshold) {
         const existingCache = await this.redis.getResource(key);
         if (existingCache) {
            return of(existingCache);
         }
         return next.handle().pipe(
            tap(async (data: Record<string, string | number> | Array<unknown>) => {
               await this.redis.putResource(key, JSON.stringify(instanceToPlain(data)), ttl);
            })
         );
      }
      return next.handle();
   }
}
