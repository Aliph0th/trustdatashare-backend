import {
   Body,
   ClassSerializerInterceptor,
   Controller,
   HttpCode,
   HttpStatus,
   Post,
   Request,
   UseInterceptors
} from '@nestjs/common';
import { LocalAuthentication } from '#/decorators';
import { AuthService } from './auth.service';
import { RegisterUserDTO, UserDTO } from './dto';

@Controller('auth')
export class AuthController {
   constructor(private readonly authService: AuthService) {}

   @Post('register')
   async register(@Body() dto: RegisterUserDTO) {
      await this.authService.createUser(dto);
   }

   @LocalAuthentication()
   @Post('login')
   @UseInterceptors(ClassSerializerInterceptor)
   @HttpCode(HttpStatus.OK)
   async login(@Request() req: any) {
      return new UserDTO(req.user);
   }
}
