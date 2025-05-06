import {
   Body,
   ClassSerializerInterceptor,
   Controller,
   Delete,
   Get,
   Headers,
   Param,
   Patch,
   Post,
   Query,
   Req,
   UseInterceptors
} from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '#/decorators';
import { UuidDTO } from '#/dto';
import { DataService } from './data.service';
import { CreateDataDTO, DataDTO, UpdateDataDTO } from './dto';
import { GetAllDataDTO } from './dto/get-all-data.dto';

@Controller('data')
@UseInterceptors(ClassSerializerInterceptor)
export class DataController {
   constructor(private readonly dataService: DataService) {}

   @Post()
   @Public()
   async create(@Body() dto: CreateDataDTO, @Req() req: Request) {
      const { id } = await this.dataService.create(dto, req);
      return { id };
   }

   @Get('/my')
   async getAllFromUser(@Query() { page, limit }: GetAllDataDTO, @Req() req: Request) {
      return await this.dataService.getUserPosts(page, limit, req.user.id);
   }

   @Delete('/:id')
   async deleteData(@Param() { id }: UuidDTO, @Req() req: Request) {
      await this.dataService.delete(id, req.user.id);
      return true;
   }

   @Get('/:id')
   @Public()
   async get(@Param() { id }: UuidDTO, @Headers('Authorization') auth?: string) {
      const { data, content } = await this.dataService.getByID(id, auth);
      const owner = data.isOwnerHidden ? null : data.owner;
      return new DataDTO({ ...data, isPublic: !data.password, owner, content });
   }

   @Patch('/:id')
   async patch(@Param() { id }: UuidDTO, @Body() dto: UpdateDataDTO, @Req() req: Request) {
      const { data, content } = await this.dataService.patch(id, dto, req.user?.id);
      const owner = data.isOwnerHidden ? null : data.owner;
      return new DataDTO({ ...data, isPublic: !data.password, owner, content });
   }
}
