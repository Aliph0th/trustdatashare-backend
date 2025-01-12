import { Body, Controller, Post, Request } from '@nestjs/common';
import { Authenticated, LocalAuthentication } from '#/decorators';
import { AuthService } from './auth.service';
import { RegisterUserDTO } from './dto';

@Controller('auth')
export class AuthController {
   constructor(private readonly authService: AuthService) {}

   @Post('register')
   async register(@Body() dto: RegisterUserDTO) {
      await this.authService.createUser(dto);
   }

   @LocalAuthentication()
   @Post('login')
   async login(@Request() req: any) {
      return req.user;
   }

   @Authenticated()
   @Post('ok')
   async ok(@Request() req: any) {
      return req.user;
   }
}
