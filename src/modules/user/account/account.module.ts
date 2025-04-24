import { Module } from '@nestjs/common';
import { SessionModule } from '../../session/session.module';
import { TokenModule } from '../../token/token.module';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
   imports: [TokenModule, SessionModule],
   controllers: [AccountController],
   providers: [AccountService],
   exports: [AccountService]
})
export class AccountModule {}
