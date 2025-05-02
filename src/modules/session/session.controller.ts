import { Body, Controller, Delete, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { DeleteSessionsDTO } from './dto/delete-session.dto';
import { SessionService } from './session.service';

@Controller('sessions')
export class SessionController {
   constructor(private readonly sessionService: SessionService) {}

   @Get('me')
   async getSessions(@Req() req: Request) {
      const sessions = await this.sessionService.findSessions(req);
      return sessions;
   }

   @Delete()
   async deleteSessions(@Body() dto: DeleteSessionsDTO, @Req() req: Request) {
      await this.sessionService.terminateSessions(dto.sessions, req);
      return true;
   }
}
