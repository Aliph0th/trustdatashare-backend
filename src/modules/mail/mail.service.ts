import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { render } from '@react-email/components';
import { SessionMetadata } from '#/types';
import RecoveryEmail from './templates/recovery.template';
import VerifyEmail from './templates/verification.template';

@Injectable()
export class MailService {
   private readonly domain: string;
   constructor(
      private readonly mailerService: MailerService,
      private readonly configService: ConfigService
   ) {
      this.domain = this.configService.getOrThrow('ALLOWED_ORIGIN');
   }

   async sendEmailVerification(email: string, username: string, token: string) {
      const html = await render(VerifyEmail({ username, code: token, domain: this.domain }));
      return await this.sendEmail(email, 'Verification', html);
   }

   async sendPasswordReset(email: string, username: string, token: string, metadata: SessionMetadata) {
      const html = await render(RecoveryEmail({ username, code: token, domain: this.domain, metadata }));
      return await this.sendEmail(email, 'Password recovery', html);
   }

   private async sendEmail(to: string, subject: string, html: string) {
      return await this.mailerService.sendMail({
         to,
         subject,
         html
      });
   }
}
