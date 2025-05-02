import 'express-session';
import { SessionMetadata, SessionUser } from './session.types';

declare module 'express-session' {
   interface SessionData {
      user: SessionUser;
      createdAt: Date;
      metadata: SessionMetadata;
      sid: string;
   }
}

declare global {
   namespace Express {
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      export interface User extends SessionUser {}
   }
}
