import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountModule } from '../modules/user/account/account.module';
import { AuthModule } from '../modules/user/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';

@Module({
   imports: [
      ConfigModule.forRoot({ isGlobal: true, expandVariables: true }),
      RedisModule,
      PrismaModule,
      AccountModule,
      AuthModule
   ]
})
export class CoreModule {}
