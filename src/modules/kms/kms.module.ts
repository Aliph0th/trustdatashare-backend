import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KmsService } from './kms.service';

@Module({
   imports: [
      HttpModule.registerAsync({
         inject: [ConfigService],
         useFactory(configService: ConfigService) {
            return { baseURL: configService.getOrThrow('YC_KMS_HOST') };
         }
      })
   ],
   providers: [KmsService],
   exports: [KmsService]
})
export class KmsModule {}
