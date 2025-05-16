export * from './user.constants';
export * from './token.constants';
export * from './api.constants';

export const METADATA = {
   PUBLIC: 'public',
   UNCOMPLETED_AUTH: 'auth_uncompleted',
   CACHED: 'cached',
   INVALIDATE: 'invalidate'
};

export const REDIS_KEYS = {
   IAM_TOKEN: 'YC_IAM',
   COOLDOWN_EMAIL_VERIFY_RESEND: (id: number) => `CD_EMAIL_VERIFY_RESEND:${id}`,
   COOLDOWN_RECOVERY: (id: string) => `CD_RECOVERY:${id}`,
   REQUEST_COUNT: (id: string) => `requests:${id}`,
   RESOURCE: (id: string) => `resource:${id}`
};
