import { Module } from '@nestjs/common';
import { TokenModule } from '../../token/token.module';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
   imports: [TokenModule],
   controllers: [AccountController],
   providers: [AccountService],
   exports: [AccountService]
})
export class AccountModule {}
