import { SetMetadata, UseInterceptors, applyDecorators } from '@nestjs/common';
import { METADATA } from '../constants';
import { CacheInterceptor, InvalidateInterceptor } from '../interceptors';
import { InvalidateMetadata } from '../types';

export * from './match.decorator';
export * from './auth.decorators';

export function Cached({
   threshold,
   ttl = 1 * 60,
   userSensitive = true
}: {
   threshold: number;
   userSensitive?: boolean;
   ttl?: number;
}) {
   return applyDecorators(
      SetMetadata(METADATA.CACHED, { threshold, ttl, userSensitive }),
      UseInterceptors(CacheInterceptor)
   );
}

export function Invalidate({
   userSensitive = true,
   version = process.env.ACTUAL_VERSION,
   ...rest
}: InvalidateMetadata) {
   return applyDecorators(
      SetMetadata(METADATA.INVALIDATE, { userSensitive, version, ...rest }),
      UseInterceptors(InvalidateInterceptor)
   );
}
