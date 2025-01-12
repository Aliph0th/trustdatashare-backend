import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { lookup } from 'geoip-lite';
import * as requestIP from 'request-ip';
import { SessionMetadata } from '#/types';

// eslint-disable-next-line @typescript-eslint/no-require-imports
import DeviceDetector = require('device-detector-js');

@Injectable()
export class SessionService {
   constructor(private readonly configService: ConfigService) {}

   private readonly countryByCode = new Intl.DisplayNames(['en'], { type: 'region' });
   private readonly deviceDetector = new DeviceDetector();
   applySessionMetadata(request: Request) {
      request.session.createdAt = new Date().toISOString();
      request.session.metadata = this.getSessionMetadata(request);
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
