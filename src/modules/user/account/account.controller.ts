import { Controller, Get, Query } from '@nestjs/common';
import { AccountService } from './account.service';
import { UserCredentialsDTO } from './dto';

@Controller('users')
export class AccountController {
   constructor(private readonly accountService: AccountService) {}

   @Get('availability')
   async checkCredentialsAvailable(@Query() dto: UserCredentialsDTO) {
      return await this.accountService.isCredentialsAvailable(dto);
   }
}
