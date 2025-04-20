import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getMailerConfig } from '$/core/config/mail.config';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';

@Module({
   imports: [
      MailerModule.forRootAsync({
         inject: [ConfigService],
         useFactory: getMailerConfig
      })
   ],
   providers: [MailService],
   exports: [MailService]
})
export class MailModule {}
