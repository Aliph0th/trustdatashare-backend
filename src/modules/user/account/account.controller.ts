import {
   Body,
   ClassSerializerInterceptor,
   Controller,
   Get,
   NotFoundException,
   Param,
   Patch,
   Query,
   Req,
   UploadedFile,
   UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { AuthUncompleted, Public } from '#/decorators';
import { NumericDTO } from '#/dto';
import { AccountService } from './account.service';
import { PatchUserDTO, PublicUserDTO, UserCredentialsDTO, UserDTO } from './dto';
import { FileValidationPipe } from './validators';

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
   @AuthUncompleted()
   async getMe(@Req() req: Request) {
      const user = await this.accountService.findByID(req.user!.id);
      if (!user) {
         throw new NotFoundException('User not found');
      }
      return new UserDTO(user);
   }

   @Get('/:id')
   @Public()
   async getUser(@Param() { id }: NumericDTO) {
      const user = await this.accountService.findByID(id);
      if (!user) {
         throw new NotFoundException('User not found');
      }
      return new PublicUserDTO(user);
   }

   @Patch('me')
   async patchMe(@Body() dto: PatchUserDTO, @Req() req: Request) {
      const user = await this.accountService.patch(req.user?.id, dto);
      return new UserDTO(user);
   }

   @Patch('avatar')
   @UseInterceptors(FileInterceptor('file'))
   async changeAvatar(@UploadedFile(new FileValidationPipe()) file: Express.Multer.File, @Req() req: Request) {
      return await this.accountService.changeAvatar(file.buffer, req.user.id);
   }
}
