import { createHash } from 'crypto';

export const getFormatDate = () => new Date().toISOString().slice(0, 10).replace(/-/g, '');
export const getISODate = () => new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');

export const hashRequest = (query = {}, body = {}) =>
   createHash('sha1').update(JSON.stringify({ query, body })).digest('base64');
export const buildCacheKey = ({
   path,
   query,
   body,
   userID
}: {
   path: string;
   query?: unknown;
   body?: unknown;
   userID?: number;
}) => {
   let hash = '';
   if (query || body) {
      hash = hashRequest(query, body);
   }
   return `${path}|${userID ? userID : ''}|${hash}`;
};
