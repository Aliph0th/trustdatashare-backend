import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthenticatedGuard, LocalAuthGuard } from '../guards';

export function LocalAuthentication() {
   return applyDecorators(UseGuards(LocalAuthGuard));
}

export function Authenticated() {
   return applyDecorators(UseGuards(AuthenticatedGuard));
}
