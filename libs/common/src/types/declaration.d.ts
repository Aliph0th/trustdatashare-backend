import 'express-session';

declare module 'express-session' {
   interface Session {
      passport: {
         user: number;
      };
      createdAt: string;
   }
}
