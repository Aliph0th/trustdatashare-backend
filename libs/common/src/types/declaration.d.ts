import 'express-session';
import { SessionMetadata } from './session.types';

declare module 'express-session' {
   interface Session {
      passport: {
         user: number;
      };
      createdAt: string;
      metadata: SessionMetadata;
   }
}
