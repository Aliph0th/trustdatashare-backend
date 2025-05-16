import {
   Body,
   ClassSerializerInterceptor,
   Controller,
   HttpCode,
   HttpStatus,
   InternalServerErrorException,
   Post,
   Req,
   UseGuards,
   UseInterceptors
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import type { Request } from 'express';
import { TokenType } from '@prisma/client';
import { AuthUncompleted, Invalidate, LocalAuthentication, Public } from '#/decorators';
import { EMAIL_VERIFICATION_TOKEN_TTL } from '../../../../libs/common/src/constants';
import { UnauthenticatedGuard } from '../../../../libs/common/src/guards';
import { MailService } from '../../mail/mail.service';
import { SessionService } from '../../session/session.service';
import { TokenService } from '../../token/token.service';
import { AccountService } from '../account/account.service';
import { UserDTO } from '../account/dto';
import { AuthService } from './auth.service';
import { EmailVerifyDTO, PasswordResetDTO, PasswordUpdateDTO, RegisterUserDTO } from './dto';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
   constructor(
      private readonly authService: AuthService,
      private readonly tokenService: TokenService,
      private readonly sessionService: SessionService,
      private readonly accountService: AccountService,
      private readonly mailService: MailService,
      private readonly configService: ConfigService
   ) {}

   @Post('register')
   @Public()
   async register(@Body() dto: RegisterUserDTO, @Req() req: Request) {
      const user = await this.authService.createUser(dto);
      req.session.sid = randomUUID();
      const token = await this.tokenService.issue(user.id, TokenType.EMAIL_VERIFICATION, EMAIL_VERIFICATION_TOKEN_TTL);
      await this.mailService.sendEmailVerification(user.email, user.username, token);
      const sessionUser = { id: user.id, isEmailVerified: user.isEmailVerified };
      await new Promise((resolve, reject) => {
         req.logIn(sessionUser, { session: false }, err => {
            if (err) {
               return reject(new InternalServerErrorException('Failed to create session'));
            }
            this.sessionService.applySessionMetadata(req, sessionUser);
            resolve(true);
         });
      });

      return new UserDTO(user);
   }

   @LocalAuthentication()
   @Post('login')
   @HttpCode(HttpStatus.OK)
   @Public()
   @Invalidate({ path: 'sessions/me' })
   async login(@Req() req: Request) {
      const user = await this.accountService.findByID(req.user.id);
      req.session.sid = randomUUID();
      return new UserDTO(user);
   }

   @Post('logout')
   @HttpCode(HttpStatus.OK)
   @AuthUncompleted()
   @Invalidate({ path: 'sessions/me' })
   async logout(@Req() req: Request) {
      return new Promise((resolve, reject) => {
         req.session.destroy(err => {
            if (err) {
               return reject(new InternalServerErrorException('Failed to destroy session'));
            }
            req.res.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'));
            resolve(true);
         });
      });
   }

   @Post('email/verify')
   @HttpCode(HttpStatus.OK)
   @AuthUncompleted()
   @Invalidate({ path: 'users/me' })
   async verifyEmail(@Body() dto: EmailVerifyDTO, @Req() req: Request) {
      await this.authService.verifyEmail(dto.token, req);
      return true;
   }

   @Post('email/resend')
   @HttpCode(HttpStatus.OK)
   @AuthUncompleted()
   async resendEmail(@Req() req: Request) {
      const cooldown = await this.authService.resendVerificationEmail(req?.user?.id);
      return { cooldown };
   }

   @Post('reset')
   @HttpCode(HttpStatus.OK)
   @Public()
   @UseGuards(UnauthenticatedGuard)
   async passwordReset(@Body() { email }: PasswordResetDTO, @Req() req: Request) {
      const cooldown = await this.authService.resetPassword(email, req);
      return { cooldown };
   }

   @Post('setup')
   @HttpCode(HttpStatus.OK)
   @Public()
   @UseGuards(UnauthenticatedGuard)
   async passwordSetup(@Body() { password, token }: PasswordUpdateDTO) {
      await this.authService.setupPassword(token, password);
      return true;
   }
}
