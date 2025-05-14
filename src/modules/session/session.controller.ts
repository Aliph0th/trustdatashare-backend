import { Controller, Delete, Get, Param, Req } from '@nestjs/common';
import type { Request } from 'express';
import { Cached, Invalidate } from '#/decorators';
import { UuidDTO } from '#/dto';
import { SessionService } from './session.service';

@Controller('sessions')
export class SessionController {
   constructor(private readonly sessionService: SessionService) {}

   @Get('me')
   @Cached({ threshold: 1, ttl: 3 * 60 })
   async getSessions(@Req() req: Request) {
      const sessions = await this.sessionService.findSessions(req);
      return sessions;
   }

   @Delete('/:id')
   @Invalidate({ path: 'sessions/me' })
   async deleteSessions(@Param('id') { id }: UuidDTO, @Req() req: Request) {
      await this.sessionService.terminateSession(id, req);
      return true;
   }
}
