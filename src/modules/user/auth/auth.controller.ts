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
import { MailService } from '../../mail/mail.service';
import { TokenService } from '../../token/token.service';
import { AuthService } from './auth.service';
import { RegisterUserDTO, UserDTO } from './dto';

@Controller('auth')
export class AuthController {
   constructor(
      private readonly authService: AuthService,
      private readonly tokenService: TokenService,
      private readonly mailService: MailService
   ) {}

   @Post('register')
   async register(@Body() dto: RegisterUserDTO) {
      const user = await this.authService.createUser(dto);
      const token = await this.tokenService.issueForEmailVerification(user.id);
      await this.mailService.sendEmailVerification(user.email, user.username, token);
      return true;
   }

   @LocalAuthentication()
   @Post('login')
   @UseInterceptors(ClassSerializerInterceptor)
   @HttpCode(HttpStatus.OK)
   async login(@Request() req: any) {
      return new UserDTO(req.user);
   }
}
