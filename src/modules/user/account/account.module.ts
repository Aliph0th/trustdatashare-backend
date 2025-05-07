import { Module } from '@nestjs/common';
import { StorageModule } from '../../storage/storage.module';
import { TokenModule } from '../../token/token.module';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
   imports: [TokenModule, StorageModule],
   controllers: [AccountController],
   providers: [AccountService],
   exports: [AccountService]
})
export class AccountModule {}
