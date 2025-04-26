import { Module } from '@nestjs/common';
import { KmsModule } from '../kms/kms.module';
import { StorageModule } from '../storage/storage.module';
import { DataController } from './data.controller';
import { DataService } from './data.service';

@Module({
   imports: [StorageModule, KmsModule],
   controllers: [DataController],
   providers: [DataService]
})
export class DataModule {}
