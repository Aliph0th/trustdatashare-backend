import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User } from '@prisma/client';
import { SessionUser } from '#/types';

type SerializeFn = (err: Error | null, payload: SessionUser) => void;
type DeserializeFn = (err: Error | null, user: SessionUser) => void;

@Injectable()
export class SessionSerializer extends PassportSerializer {
   constructor() {
      super();
   }
   serializeUser({ id, isEmailVerified, isPremium }: User, done: SerializeFn) {
      done(null, { id, isEmailVerified, isPremium });
   }

   async deserializeUser(payload: SessionUser, done: DeserializeFn) {
      done(null, payload);
   }
}
