import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
   async canActivate(context: ExecutionContext): Promise<boolean> {
      const result = (await super.canActivate(context)) as boolean;
      await super.logIn(context.switchToHttp().getRequest());
      return result;
   }
}

@Injectable()
export class AuthenticatedGuard implements CanActivate {
   async canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest();
      return request.isAuthenticated();
   }
}
