import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { IAM_TOKEN_TTL_PADDING, REDIS_KEYS } from '#/constants';
import { KMSResponse } from '#/types';
import { RedisService } from '../../core/redis/redis.service';

@Injectable()
export class KmsService {
   constructor(
      private readonly http: HttpService,
      private readonly configService: ConfigService,
      private readonly redisService: RedisService
   ) {}

   async encrypt(data: string, aad?: Record<string, string | number>) {
      let token = await this.redisService.get(REDIS_KEYS.IAM_TOKEN);
      if (!token) {
         token = await this.obtainIAMToken();
      }

      const body: Record<string, string | number> = { plaintext: Buffer.from(data).toString('base64') };
      if (aad) {
         body.aadContext = Buffer.from(JSON.stringify(aad)).toString('base64');
      }

      try {
         const {
            data: { ciphertext, versionId }
         } = await this.http.axiosRef.post<KMSResponse>(
            `${this.configService.getOrThrow('YC_PRIMARY_KEY_ID')}:encrypt`,
            body,
            { headers: { Authorization: `Bearer ${token}` } }
         );
         return { ciphertext, versionID: versionId };
      } catch (_) {
         return null;
      }
   }

   async decrypt(ciphertext: string, aad?: Record<string, string | number>) {
      let token = await this.redisService.get(REDIS_KEYS.IAM_TOKEN);
      if (!token) {
         token = await this.obtainIAMToken();
      }

      const body: Record<string, string | number> = { ciphertext };
      if (aad) {
         body.aadContext = Buffer.from(JSON.stringify(aad)).toString('base64');
      }

      try {
         const {
            data: { plaintext, versionId }
         } = await this.http.axiosRef.post<KMSResponse>(
            `${this.configService.getOrThrow('YC_PRIMARY_KEY_ID')}:decrypt`,
            body,
            { headers: { Authorization: `Bearer ${token}` } }
         );
         return { plaintext: Buffer.from(plaintext, 'base64').toString('utf8'), versionID: versionId };
      } catch (_) {
         return null;
      }
   }

   async obtainIAMToken() {
      const privateKey = this.configService.getOrThrow<string>('YC_PRIVATE_KEY').replace(/\\n/gm, '\n');
      const jwtToken = jwt.sign({}, privateKey, {
         algorithm: 'PS256',
         issuer: this.configService.getOrThrow('YC_SA_ID'),
         audience: this.configService.getOrThrow('YC_IAM_TOKEN_HOST'),
         expiresIn: '20m',
         keyid: this.configService.getOrThrow('YC_KEY_ID')
      });

      const {
         data: { iamToken, expiresAt }
      } = await this.http.axiosRef.post<{ iamToken: string; expiresAt: string }>(
         '/',
         { jwt: jwtToken },
         { baseURL: this.configService.getOrThrow('YC_IAM_TOKEN_HOST') }
      );

      await this.redisService.set(
         REDIS_KEYS.IAM_TOKEN,
         iamToken,
         'PX',
         new Date(expiresAt).getTime() - Date.now() - IAM_TOKEN_TTL_PADDING
      );
      return iamToken;
   }
}
