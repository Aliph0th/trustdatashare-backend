import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { DataController } from './data.controller';
import { DataService } from './data.service';

@Module({
   imports: [StorageModule],
   controllers: [DataController],
   providers: [DataService]
})
export class DataModule {}
