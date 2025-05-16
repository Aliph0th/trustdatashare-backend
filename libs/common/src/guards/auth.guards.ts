import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { SessionService } from '$/modules/session/session.service';
import { Request } from 'express';
import { METADATA } from '../constants';

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
   constructor(private readonly reflector: Reflector) {}

   async canActivate(context: ExecutionContext) {
      const isPublic = this.reflector.get(METADATA.PUBLIC, context.getHandler());
      if (isPublic) {
         return true;
      }
      const request = context.switchToHttp().getRequest<Request>();
      if (!request.isAuthenticated()) {
         throw new UnauthorizedException();
      }
      const notCompletedAllowed = this.reflector.get(METADATA.UNCOMPLETED_AUTH, context.getHandler());
      if (notCompletedAllowed) {
         return true;
      }
      if (!request.user?.isEmailVerified) {
         throw new UnauthorizedException('You must verify email first');
      }
      return true;
   }
}

@Injectable()
export class UnauthenticatedGuard implements CanActivate {
   async canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest<Request>();
      if (request.isAuthenticated()) {
         throw new BadRequestException('You are already authenticated');
      }
      return true;
   }
}
