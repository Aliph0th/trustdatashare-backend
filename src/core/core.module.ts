import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';

@Module({
   imports: [ConfigModule.forRoot({ isGlobal: true, expandVariables: true }), RedisModule, PrismaModule]
})
export class CoreModule {}
