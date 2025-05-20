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
import { Cached, Invalidate, Public } from '#/decorators';
import { NumericDTO, UuidDTO } from '#/dto';
import { DataService } from './data.service';
import { CreateDataDTO, DataDTO, GetAllDataDTO, UpdateDataDTO } from './dto';

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
   @Cached({ threshold: 1, ttl: 10 * 60 })
   async getAllMy(@Query() { page, limit }: GetAllDataDTO, @Req() req: Request) {
      return await this.dataService.getUserPosts(page, limit, req.user.id);
   }

   @Get('/visible/:id')
   @Public()
   @Cached({ threshold: 1, ttl: 10 * 60, userSensitive: false })
   async getAllFromUser(@Param() { id }: NumericDTO, @Query() { page, limit }: GetAllDataDTO) {
      return await this.dataService.getUserPosts(page, limit, id, true);
   }

   @Get('/:id')
   @Public()
   @Cached({ threshold: 3, ttl: 5 * 60, userSensitive: false })
   async get(@Param() { id }: UuidDTO, @Req() req: Request, @Headers('Authorization') auth?: string) {
      const { data, content } = await this.dataService.getByID({ id, userID: req?.user?.id, authorization: auth });
      const isYours = data.ownerID && data.ownerID === req?.user?.id;
      return new DataDTO({ ...data, isYours, content });
   }

   @Get('/:id/edit')
   @Cached({ threshold: 3, ttl: 1.5 * 60 })
   async getForEdit(@Param() { id }: UuidDTO, @Req() req: Request) {
      const { data, content } = await this.dataService.getByID({ id, userID: req.user.id, ownPost: true });
      const isYours = data.ownerID && data.ownerID === req.user.id;
      return new DataDTO({ ...data, isYours, content });
   }

   @Delete('/:id')
   @Invalidate({ path: 'data/<id>', userSensitive: false })
   @Invalidate({ path: 'data/<id>/edit' })
   async deleteData(@Param() { id }: UuidDTO, @Req() req: Request) {
      await this.dataService.delete(id, req.user.id);
      return true;
   }

   @Patch('/:id')
   @Invalidate({ path: 'data/<id>', userSensitive: false })
   @Invalidate({ path: 'data/<id>/edit' })
   async patch(@Param() { id }: UuidDTO, @Body() dto: UpdateDataDTO, @Req() req: Request) {
      await this.dataService.patch(id, dto, req.user?.id);
      return true;
   }
}
