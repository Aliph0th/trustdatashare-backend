import {
   Body,
   ClassSerializerInterceptor,
   Controller,
   Get,
   Headers,
   Param,
   Post,
   Req,
   UseInterceptors
} from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '#/decorators';
import { DataService } from './data.service';
import { CreateDataDTO, DataDTO, GetDataDTO } from './dto';

@Controller('data')
@UseInterceptors(ClassSerializerInterceptor)
export class DataController {
   constructor(private readonly dataService: DataService) {}

   @Post()
   @Public()
   async create(@Body() dto: CreateDataDTO, @Req() req: Request) {
      const data = await this.dataService.create(dto, req);
      const owner = data.isOwnerHidden ? null : data.owner;
      return new DataDTO({ ...data, isPublic: !data.password, owner });
   }

   @Get('/:id')
   @Public()
   async get(@Param() { id }: GetDataDTO, @Headers('Authorization') auth?: string) {
      const { data, content } = await this.dataService.getByID(id, auth);
      const owner = data.isOwnerHidden ? null : data.owner;
      return new DataDTO({ ...data, isPublic: !data.password, owner, content });
   }
}
