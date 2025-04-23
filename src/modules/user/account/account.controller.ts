import {
   Body,
   ClassSerializerInterceptor,
   Controller,
   Get,
   NotFoundException,
   Patch,
   Query,
   Req,
   UseInterceptors
} from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '#/decorators';
import { AccountService } from './account.service';
import { PatchUserDTO, UserCredentialsDTO, UserDTO } from './dto';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class AccountController {
   constructor(private readonly accountService: AccountService) {}

   @Get('availability')
   @Public()
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

   @Patch('me')
   async patchMe(@Body() dto: PatchUserDTO, @Req() req: Request) {
      const user = await this.accountService.patch(req.user?.id, dto);
      return new UserDTO(user);
   }
}
