import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../core/prisma/prisma.module';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
   imports: [PrismaModule],
   controllers: [AccountController],
   providers: [AccountService],
   exports: [AccountService]
})
export class AccountModule {}
