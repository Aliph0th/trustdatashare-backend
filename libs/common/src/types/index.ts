export * from './session.types';
export * from './api.types';

export type StorageOptions = {
   file: string;
   folder: string;
   ext?: 'txt' | 'webp';
};

export type CacheMetadata = {
   ttl: number;
   threshold: number;
   userSensitive: boolean;
};

export type InvalidateMetadata = {
   path: string;
   userSensitive?: boolean;
   version?: string;
   query?: unknown;
   body?: unknown;
};
