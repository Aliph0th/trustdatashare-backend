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
import { AccountService } from '../account/account.service';
import { UserDTO } from '../account/dto';
import { AuthService } from './auth.service';
import { EmailVerifyDTO, RegisterUserDTO } from './dto';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
   constructor(
      private readonly authService: AuthService,
      private readonly tokenService: TokenService,
      private readonly sessionService: SessionService,
      private readonly accountService: AccountService,
      private readonly mailService: MailService
   ) {}

   @Post('register')
   @Public()
   async register(@Body() dto: RegisterUserDTO, @Req() req: Request) {
      const user = await this.authService.createUser(dto);
      const token = await this.tokenService.issueForEmailVerification(user.id);
      // await this.mailService.sendEmailVerification(user.email, user.username, token);

      this.sessionService.applySessionMetadata(req, { id: user.id, isEmailVerified: false, isPremium: false });

      return new UserDTO(user);
   }

   @LocalAuthentication()
   @Post('login')
   @HttpCode(HttpStatus.OK)
   @Public()
   async login(@Req() req: Request) {
      const user = await this.accountService.findByID(req.user.id);
      return new UserDTO(user);
   }

   @Post('logout')
   @AuthUncompleted()
   async logout(@Req() req: Request) {
      req.logOut(() => {});
      return true;
   }

   @Post('email/verify')
   @HttpCode(HttpStatus.OK)
   @AuthUncompleted()
   async verifyEmail(@Body() dto: EmailVerifyDTO, @Req() req: Request) {
      await this.authService.verifyEmail(dto.token, req);
      return true;
   }

   @Post('email/resend')
   @HttpCode(HttpStatus.OK)
   @AuthUncompleted()
   async resendEmail(@Req() req: Request) {
      await this.authService.resendEmail(req?.user?.id);
      return true;
   }
}
