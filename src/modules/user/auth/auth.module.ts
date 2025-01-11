import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../../../core/prisma/prisma.module';
import { AccountModule } from '../account/account.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
   imports: [AccountModule, PassportModule, PrismaModule],
   controllers: [AuthController],
   providers: [AuthService, LocalStrategy]
})
export class AuthModule {}
