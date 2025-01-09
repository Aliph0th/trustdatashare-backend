import { type ExecutionContext, createParamDecorator } from '@nestjs/common';
import { PrismaModels } from '../../types';

export const Model = createParamDecorator((data: PrismaModels, ctx: ExecutionContext) => {
   const request = ctx.switchToHttp().getRequest();
   console.log(request);
   return 2;
});
