import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { USER_PASSWORD_SALT_ROUNDS } from '#/constants';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { AccountService } from '../account/account.service';
import type { RegisterUserDTO } from './dto';

@Injectable()
export class AuthService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly users: AccountService
   ) {}

   async createUser({ email, username, password }: RegisterUserDTO) {
      const candidate = await this.prisma.user.findFirst({
         where: { OR: [{ email }, { username }] }
      });

      if (candidate) {
         throw new ConflictException('User with such email or username already exists');
      }
      const hashedPassword = await bcrypt.hash(password, USER_PASSWORD_SALT_ROUNDS);
      await this.prisma.user.create({ data: { email, username, password: hashedPassword } });
      return true;
   }

   async validateUser(login: string, password: string) {
      const user = await this.prisma.user.findFirst({ where: { OR: [{ email: login }, { username: login }] } });
      if (!user) {
         throw new BadRequestException('Invalid login or password');
      }

      const isPasswordsMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordsMatch) {
         throw new BadRequestException('Invalid login or password');
      }

      return user;
   }
}
