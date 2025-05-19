import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { RedisService } from '$/core/redis/redis.service';
import type { Request } from 'express';
import { Observable } from 'rxjs';
import { METADATA } from '../constants';
import { InvalidateMetadata } from '../types';
import { buildCacheKey } from '../utils';

@Injectable()
export class InvalidateInterceptor implements NestInterceptor {
   constructor(
      private readonly redis: RedisService,
      private readonly reflector: Reflector,
      private readonly configService: ConfigService
   ) {}

   async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      const { user, params } = context.switchToHttp().getRequest<Request>();
      const { path, userSensitive, version, query, body } = this.reflector.get<InvalidateMetadata>(
         METADATA.INVALIDATE,
         context.getHandler()
      );

      let pathname = path;
      const match = path.matchAll(/<(?<param>\w+)>/g).next().value;
      const paramName = match?.groups?.param;
      if (match && params[paramName]) {
         pathname = pathname.replace(match[0], params[paramName]);
      }

      let apiPrefix = this.configService.get('API_PREFIX');
      if (apiPrefix && !apiPrefix.startsWith('/')) {
         apiPrefix = '/' + apiPrefix;
      }
      await this.redis.invalidate(
         buildCacheKey({
            path: `${apiPrefix}/v${version}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
            userID: userSensitive ? user?.id : null,
            query,
            body
         })
      );

      return next.handle();
   }
}
