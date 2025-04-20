import 'express-session';
import { User as PrismaUser } from '@prisma/client';
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

declare global {
   namespace Express {
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      export interface User extends PrismaUser {}
   }
}
