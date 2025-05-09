export * from './user.constants';
export * from './token.constants';
export * from './api.constants';

export const METADATA = {
   PUBLIC: 'public',
   UNCOMPLETED_AUTH: 'auth_uncompleted'
};

export const REDIS_KEYS = {
   IAM_TOKEN: 'YC_IAM',
   COOLDOWN_EMAIL_VERIFY_RESEND: (id: number) => `CD_EMAIL_VERIFY_RESEND:${id}`
};
