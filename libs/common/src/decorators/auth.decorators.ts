import { UseGuards, applyDecorators } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';
import { METADATA } from '../constants';
import { LocalAuthGuard } from '../guards';

export function LocalAuthentication() {
   return applyDecorators(UseGuards(LocalAuthGuard));
}

export const Public = () => SetMetadata(METADATA.PUBLIC, true);

export const AuthUncompleted = () => SetMetadata(METADATA.UNCOMPLETED_AUTH, true);
