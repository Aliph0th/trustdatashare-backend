import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';

@Module({
   imports: [
      HttpModule.registerAsync({
         inject: [ConfigService],
         useFactory(configService: ConfigService) {
            return { baseURL: `https://${configService.getOrThrow('S3_HOST')}` };
         }
      })
   ],
   providers: [StorageService],
   exports: [StorageService]
})
export class StorageModule {}
