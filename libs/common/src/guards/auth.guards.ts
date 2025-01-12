import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { SessionService } from '../../../../src/modules/session/session.service';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
   constructor(private readonly sessionService: SessionService) {
      super();
   }

   async canActivate(context: ExecutionContext): Promise<boolean> {
      const result = (await super.canActivate(context)) as boolean;
      const request = context.switchToHttp().getRequest<Request>();
      await super.logIn(request);
      this.sessionService.applySessionMetadata(request);
      return result;
   }

   handleRequest(err: Error, user: any, _: any, context: ExecutionContext) {
      if (err) {
         throw err;
      }
      const request = context.switchToHttp().getRequest();
      if (!request.body?.login || !request.body?.password || !user) {
         throw new UnauthorizedException('Missing credentials');
      }
      return user;
   }
}

@Injectable()
export class AuthenticatedGuard implements CanActivate {
   async canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest();
      return request.isAuthenticated();
   }
}
