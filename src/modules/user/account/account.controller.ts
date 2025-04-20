import {
   ClassSerializerInterceptor,
   Controller,
   Get,
   NotFoundException,
   Query,
   Req,
   UseInterceptors
} from '@nestjs/common';
import type { Request } from 'express';
import { AccountService } from './account.service';
import { UserCredentialsDTO, UserDTO } from './dto';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class AccountController {
   constructor(private readonly accountService: AccountService) {}

   @Get('availability')
   async checkCredentialsAvailable(@Query() dto: UserCredentialsDTO) {
      return await this.accountService.isCredentialsAvailable(dto);
   }

   @Get('me')
   async getMe(@Req() req: Request) {
      const user = await this.accountService.findByID(req.user!.id);
      if (!user) {
         throw new NotFoundException('User not found');
      }
      return new UserDTO(user);
   }
}
