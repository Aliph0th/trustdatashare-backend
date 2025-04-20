import {
   Body,
   ClassSerializerInterceptor,
   Controller,
   HttpCode,
   HttpStatus,
   Post,
   Req,
   UseInterceptors
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthUncompleted, LocalAuthentication, Public } from '#/decorators';
import { MailService } from '../../mail/mail.service';
import { SessionService } from '../../session/session.service';
import { TokenService } from '../../token/token.service';
import { UserDTO } from '../account/dto';
import { AuthService } from './auth.service';
import { EmailVerifyDTO, RegisterUserDTO } from './dto';

@Controller('auth')
export class AuthController {
   constructor(
      private readonly authService: AuthService,
      private readonly tokenService: TokenService,
      private readonly mailService: MailService,
      private readonly sessionService: SessionService
   ) {}

   @Post('register')
   @Public()
   async register(@Body() dto: RegisterUserDTO, @Req() req: Request) {
      const user = await this.authService.createUser(dto);
      const token = await this.tokenService.issueForEmailVerification(user.id);
      await this.mailService.sendEmailVerification(user.email, user.username, token);

      this.sessionService.applySessionMetadata(req, user.id);

      return true;
   }

   @LocalAuthentication()
   @Post('login')
   @UseInterceptors(ClassSerializerInterceptor)
   @HttpCode(HttpStatus.OK)
   @Public()
   async login(@Req() req: Request) {
      return new UserDTO(req.user!);
   }

   @Post('email/verify')
   @HttpCode(HttpStatus.OK)
   @AuthUncompleted()
   async verifyEmail(@Body() dto: EmailVerifyDTO) {
      await this.authService.verifyEmail(dto.token);
      return true;
   }
}
