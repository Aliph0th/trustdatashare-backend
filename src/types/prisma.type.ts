import { PrismaClient } from '@prisma/client';

export type PrismaModels = keyof Omit<
   PrismaClient,
   | symbol
   | '$on'
   | '$connect'
   | '$disconnect'
   | '$use'
   | '$executeRaw'
   | '$executeRawUnsafe'
   | '$queryRaw'
   | '$queryRawUnsafe'
   | '$transaction'
   | '$extends'
>;
