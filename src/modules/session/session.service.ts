import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { SessionData } from 'express-session';
import { lookup } from 'geoip-lite';
import * as requestIP from 'request-ip';
import { ActiveSession, SessionMetadata, SessionUser } from '#/types';
import { RedisService } from '../../core/redis/redis.service';

// eslint-disable-next-line @typescript-eslint/no-require-imports
import DeviceDetector = require('device-detector-js');

@Injectable()
export class SessionService {
   constructor(
      private readonly configService: ConfigService,
      private readonly redisService: RedisService
   ) {}

   private readonly countryByCode = new Intl.DisplayNames(['en'], { type: 'region' });
   private readonly deviceDetector = new DeviceDetector();

   applySessionMetadata(request: Request, user?: SessionUser) {
      request.session.createdAt = new Date();
      request.session.metadata = this.getSessionMetadata(request);
      if (user) {
         request.session.user = user;
      }
   }

   async findSessions(req: Request) {
      const userID = req.user.id;
      if (!userID) {
         return null;
      }
      const sessions = (await this.getUserSessions(userID))
         .map<ActiveSession>(session => ({
            sid: session.sid,
            createdAt: new Date(session.createdAt),
            metadata: session.metadata
         }))
         .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return {
         current: sessions.filter(session => session.sid === req.session.sid)[0],
         sessions: sessions.filter(session => session.sid !== req.session.sid)
      };
   }

   async terminateSessions(sessions: string[], req: Request) {
      if (sessions.includes(req.session.sid)) {
         throw new BadRequestException('You cannot terminate current session');
      }
      const activeSessions = await this.getUserSessions(req.user.id);
      const ids = [];
      for (const id of sessions) {
         const session = activeSessions.find(active => active.sid === id);
         if (!session) {
            throw new NotFoundException(`Session with id ${id} not found`);
         }
         ids.push(session.key);
      }
      await this.redisService.del(...ids);
   }

   private async getUserSessions(userID: number) {
      const keys = await this.redisService.keys(`${this.configService.getOrThrow('REDIS_STORE_PREFIX')}*`);
      const sessions = [];

      for (const key of keys) {
         const sessionData = await this.redisService.get(key);
         if (!sessionData) {
            continue;
         }
         const session = JSON.parse(sessionData) as SessionData & {
            passport: {
               user: SessionUser;
            };
         };
         if (session?.passport?.user?.id === userID) {
            sessions.push({ ...session, key });
         }
      }

      return sessions;
   }

   private getSessionMetadata(request: Request): SessionMetadata {
      const isDev = this.configService.get('NODE_ENV') === 'development';
      const ip = isDev ? '104.174.125.138' : requestIP.getClientIp(request) || 'Undefined IP';
      const location = lookup(ip);
      const device = this.deviceDetector.parse(request.headers['user-agent'] || '');
      let client: string = '';
      let os: string = '';
      if (device?.client?.name) {
         client += device?.client?.name;
         if (device?.client?.version) client += ` ${device?.client?.version}`;
      }
      if (device?.os?.name) {
         os += device?.os?.name;
         if (device?.os?.version) os += ` ${device?.os?.version}`;
         if (device?.os?.platform) os += ` ${device?.os?.platform}`;
      }
      return {
         ip,
         location: {
            latitude: location?.ll[0],
            longitude: location?.ll[1],
            country: location?.country ? this.countryByCode.of(location.country) : undefined,
            city: location?.city
         },
         device: {
            client,
            os,
            device: device?.device?.type
         }
      };
   }
}
