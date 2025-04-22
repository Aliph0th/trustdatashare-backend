import { Body, ClassSerializerInterceptor, Controller, Post, Req, UseInterceptors } from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '#/decorators';
import { DataService } from './data.service';
import { CreateDataDTO, DataDTO } from './dto';

@Controller('data')
@UseInterceptors(ClassSerializerInterceptor)
export class DataController {
   constructor(private readonly dataService: DataService) {}

   @Post()
   @Public()
   async create(@Body() dto: CreateDataDTO, @Req() req: Request) {
      const data = await this.dataService.create(dto, req);
      return new DataDTO({ ...data, isPublic: !!data.password });
   }
}
