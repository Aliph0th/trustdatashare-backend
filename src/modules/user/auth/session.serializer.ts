import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User } from '@prisma/client';
import { AccountService } from '../account/account.service';

type SerializeFn = (err: Error | null, payload: { id: number }) => void;
type DeserializeFn = (err: Error | null, user: User) => void;

@Injectable()
export class SessionSerializer extends PassportSerializer {
   constructor(private readonly accountService: AccountService) {
      super();
   }
   serializeUser(user: User, done: SerializeFn) {
      done(null, { id: user.id });
   }

   async deserializeUser(payload: { id: number }, done: DeserializeFn) {
      const user = await this.accountService.findByID(payload.id);
      done(null, user!);
   }
}
