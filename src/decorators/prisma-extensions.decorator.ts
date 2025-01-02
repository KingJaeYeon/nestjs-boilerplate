import { PrismaClient } from '@prisma/client';

export type DaoExtension = (client: PrismaClient) => any;

export const EXTENSIONS_METADATA_KEY = Symbol('extensions');

// decorators.ts
export function PrismaExtensions(extensions: DaoExtension[]) {
  return function (constructor: any) {
    Reflect.defineMetadata(EXTENSIONS_METADATA_KEY, extensions, constructor);
  };
}

export interface ExtensionMetadata {
  propertyKey: string;
  extension: DaoExtension;
}
