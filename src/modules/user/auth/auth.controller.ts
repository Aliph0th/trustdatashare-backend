import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard, LocalAuthGuard } from '#/guards';
import { AuthService } from './auth.service';
import { RegisterUserDTO } from './dto';

@Controller('auth')
export class AuthController {
   constructor(private readonly authService: AuthService) {}

   @Post('register')
   async register(@Body() dto: RegisterUserDTO) {
      await this.authService.createUser(dto);
   }

   @UseGuards(LocalAuthGuard)
   @Post('login')
   async login(@Request() req: any) {
      return req.user;
   }

   @UseGuards(AuthenticatedGuard)
   @Post('ok')
   async ok(@Request() req: any) {
      return req.user;
   }
}
