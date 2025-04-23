import 'express-session';
import { SessionMetadata, SessionUser } from './session.types';

declare module 'express-session' {
   interface Session {
      passport: {
         user: SessionUser;
      };
      createdAt: string;
      metadata: SessionMetadata;
   }
}

declare global {
   namespace Express {
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      export interface User extends SessionUser {}
   }
}
