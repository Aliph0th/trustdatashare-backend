import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MailModule } from '../../mail/mail.module';
import { SessionModule } from '../../session/session.module';
import { TokenModule } from '../../token/token.module';
import { AccountModule } from '../account/account.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionSerializer } from './session.serializer';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
   imports: [AccountModule, PassportModule.register({ session: true }), SessionModule, TokenModule, MailModule],
   controllers: [AuthController],
   providers: [AuthService, LocalStrategy, SessionSerializer]
})
export class AuthModule {}
