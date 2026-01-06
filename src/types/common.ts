import { NextFunction, Request, Response } from 'express';

export interface EnvironmentVariables {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  DATABASE_URL: string;
  JWT_SECRET: string;
  CRYPTO_SECRET: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_CALLBACK_URL?: string;
}

export type AsyncController = (req: Request, res: Response, next: NextFunction) => Promise<void>;
