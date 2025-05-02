import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { SessionService } from './session.service';

@Controller('sessions')
export class SessionController {
   constructor(private readonly sessionService: SessionService) {}

   @Get('me')
   async getSessions(@Req() req: Request) {
      const sessions = await this.sessionService.findSessions(req);
      return sessions;
   }
}
