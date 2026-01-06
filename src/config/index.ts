import { env } from './env-validations';
import crypto from 'crypto';

const normalizedCryptoKey = crypto.createHash('sha256').update(env.CRYPTO_SECRET).digest();

export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  jwt: {
    secret: env.JWT_SECRET,
  },

  crypto: {
    secret: normalizedCryptoKey, // 32-byte normalized key
    raw: env.CRYPTO_SECRET,
  },

  google: {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    callbackUrl: env.GOOGLE_CALLBACK_URL,
  },
} as const;

export default config;
