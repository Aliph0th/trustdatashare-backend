export type S3Authorization = {
   method: 'GET' | 'PUT' | 'DELETE';
   resource: string;
   query?: Record<string, string | number>;
   headers: Record<string, string | number>;
   payloadHash: string;
};

export type KMSResponse = {
   keyId: string;
   versionId: string;
   ciphertext?: string;
   plaintext?: string;
};
