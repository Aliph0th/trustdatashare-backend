import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { render } from '@react-email/components';
import VerifyEmail from './templates/verification.template';

@Injectable()
export class MailService {
   constructor(
      private readonly mailerService: MailerService,
      private readonly configService: ConfigService
   ) {}

   async sendEmailVerification(email: string, username: string, token: string) {
      const domain = this.configService.getOrThrow('ALLOWED_ORIGIN');
      const html = await render(VerifyEmail({ username, code: token, domain }));
      return await this.sendEmail(email, 'Verification', html);
   }

   private async sendEmail(to: string, subject: string, html: string) {
      return await this.mailerService.sendMail({
         to,
         subject,
         html
      });
   }
}
