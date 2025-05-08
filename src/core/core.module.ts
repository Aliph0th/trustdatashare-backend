import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import { DataModule } from '../modules/data/data.module';
import { SessionModule } from '../modules/session/session.module';
import { AccountModule } from '../modules/user/account/account.module';
import { AuthModule } from '../modules/user/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';

dotenvExpand.expand(dotenv.config());

@Module({
   imports: [
      ConfigModule.forRoot({
         isGlobal: true,
         expandVariables: true,
         cache: true,
         ignoreEnvFile: process.env.NODE_ENV === 'production'
      }),
      RedisModule,
      PrismaModule,
      AccountModule,
      AuthModule,
      SessionModule,
      DataModule,
      ScheduleModule.forRoot()
   ]
})
export class CoreModule {}
