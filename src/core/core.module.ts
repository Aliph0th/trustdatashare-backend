import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';

@Module({
   imports: [ConfigModule.forRoot({ isGlobal: true, expandVariables: true }), RedisModule]
})
export class CoreModule {}
