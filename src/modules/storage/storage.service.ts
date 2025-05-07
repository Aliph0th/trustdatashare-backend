import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { stringify as UriEncode } from 'qs';
import { S3Authorization, StorageOptions } from '#/types';
import { getFormatDate, getISODate } from '#/utils';

const MIMES: Record<StorageOptions['ext'], string> = {
   txt: 'text/plain',
   webp: 'image/webp'
};

@Injectable()
export class StorageService {
   constructor(
      private readonly configService: ConfigService,
      private readonly http: HttpService
   ) {}

   async get({ file, folder, ext = 'txt' }: StorageOptions) {
      const resource = `${folder}/${file}.${ext}`;
      const payloadHash = this.SHA256('', 'hex');
      const headers: Record<string, string | number> = {
         host: this.host,
         'x-amz-content-sha256': payloadHash,
         'x-amz-date': getISODate()
      };
      const authorization = this.signAuthorization({
         method: 'GET',
         payloadHash,
         resource,
         headers
      });
      const { data } = await this.http.axiosRef.get<Buffer>(resource, {
         headers: { ...headers, Authorization: authorization },
         responseType: 'arraybuffer'
      });
      return data;
   }

   async delete({ file, folder, ext = 'txt' }: StorageOptions) {
      const resource = `${folder}/${file}.${ext}`;
      const payloadHash = this.SHA256('', 'hex');
      const headers: Record<string, string | number> = {
         host: this.host,
         'x-amz-content-sha256': payloadHash,
         'x-amz-date': getISODate()
      };
      const authorization = this.signAuthorization({
         method: 'DELETE',
         payloadHash,
         resource,
         headers
      });
      await this.http.axiosRef.delete<Buffer>(resource, {
         headers: { ...headers, Authorization: authorization }
      });
      return file;
   }

   async put(
      content: string | Buffer,
      { file, folder, ext = 'txt' }: StorageOptions,
      acl: 'private' | 'public-read' = 'private'
   ) {
      const buffer = typeof content === 'string' ? Buffer.from(content, 'utf-8') : content;
      const payloadHash = this.SHA256(buffer || '', 'hex');
      const resource = `${folder}/${file}.${ext}`;
      const headers: Record<string, string | number> = {
         'Content-Length': buffer.byteLength,
         'Content-Type': MIMES[ext],
         host: this.host,
         'x-amz-content-sha256': payloadHash,
         'x-amz-date': getISODate(),
         'x-amz-storage-class': 'STANDARD',
         'x-amz-acl': acl
      };

      const authorization = this.signAuthorization({
         method: 'PUT',
         payloadHash,
         resource,
         headers
      });
      // const a = new RequestSigner(
      //    {
      //       host: this.host,
      //       headers,
      //       method: 'PUT',
      //       region: 'ru-msk',
      //       path: resource,
      //       body: buffer,
      //       service: 's3'
      //    },
      //    { accessKeyId: '4AAUkUAmkaEWt7a8E1AvFi', secretAccessKey: 'eRjXS9MP1QXR6BDvsTSjGtWWVwcqKRbQMxowck8mnyV' }
      // );
      // console.log('canon aws\n', a.canonicalHeaders());
      // console.log('sign aws\n', a.signedHeaders());
      // console.log('my', authorization);
      await this.http.axiosRef.put(resource, buffer, {
         headers: { ...headers, Authorization: authorization }
      });
      return file;
   }

   private signAuthorization({ method, headers, resource, payloadHash, query = {} }: S3Authorization) {
      const canonicalRequest = this.getCanonicalRequest({ method, headers, resource, payloadHash, query });
      const stringToSign = this.getStringToSign(canonicalRequest);

      const credential = `${this.configService.getOrThrow('S3_ACCESS_KEY')}/${getFormatDate()}/${this.configService.getOrThrow('S3_REGION')}/s3/aws4_request`;
      const signature = this.getSignature(stringToSign);

      const header = `AWS4-HMAC-SHA256 Credential=${credential},SignedHeaders=${this.getSignedHeaders(headers)},Signature=${signature}`;
      return header;
   }

   private getSignature(stringToSign: string) {
      const signingKey = this.getSigningKey();
      const signature = this.HMACSHA256(signingKey, stringToSign, 'hex');
      return signature;
   }

   private getCanonicalRequest({ method, headers, resource, payloadHash, query }: Required<S3Authorization>) {
      if (!resource.startsWith('/')) resource = '/' + resource;
      const canonicalHeaders = Object.entries(headers)
         .reduce((canonical, [key, value]) => {
            canonical.push(`${key.toLowerCase()}:${typeof value === 'string' ? value.trim() : value}`);
            return canonical;
         }, [] as string[])
         .sort()
         .join('\n');

      const request = `${method}\n${resource}\n${UriEncode(query, { format: 'RFC3986' })}\n${canonicalHeaders}\n\n${this.getSignedHeaders(headers)}\n${payloadHash}`;
      return this.SHA256(request, 'hex');
   }

   private getStringToSign(canonicalRequest: string) {
      const scope = `${getFormatDate()}/${this.configService.getOrThrow('S3_REGION')}/s3/aws4_request`;
      const stringToSign = `AWS4-HMAC-SHA256\n${getISODate()}\n${scope}\n${canonicalRequest}`;

      return stringToSign;
   }

   private getSigningKey() {
      const dateKey = this.HMACSHA256('AWS4' + this.configService.getOrThrow('S3_SECRET_KEY'), getFormatDate());
      const dateRegionKey = this.HMACSHA256(dateKey, this.configService.getOrThrow('S3_REGION'));
      const dateRegionServiceKey = this.HMACSHA256(dateRegionKey, 's3');
      const signingKey = this.HMACSHA256(dateRegionServiceKey, 'aws4_request');
      return signingKey;
   }

   private getSignedHeaders(headers: S3Authorization['headers']) {
      return Object.keys(headers)
         .map(header => header.toLowerCase())
         .sort()
         .join(';');
   }

   private get host() {
      return `${this.configService.getOrThrow('S3_BUCKET')}.${this.configService.getOrThrow('S3_HOST')}`;
   }

   private HMACSHA256(
      key: crypto.BinaryLike,
      message: string,
      encoding?: crypto.BinaryToTextEncoding
   ): string | Buffer<ArrayBufferLike> {
      return crypto.createHmac('sha256', key).update(message, 'utf-8').digest(encoding);
   }

   private SHA256(string: crypto.BinaryLike, encoding: crypto.BinaryToTextEncoding) {
      return crypto.createHash('sha256').update(string).digest(encoding);
   }
}
