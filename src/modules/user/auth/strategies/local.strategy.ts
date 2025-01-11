import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import type { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
   constructor(private authService: AuthService) {
      super({ usernameField: 'login' });
   }

   async validate(login: string, password: string): Promise<any> {
      return await this.authService.validateUser(login, password);
   }
}
