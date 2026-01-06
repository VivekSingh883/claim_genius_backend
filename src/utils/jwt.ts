import jwt from 'jsonwebtoken';
import { config } from '../config';

export const signJwt = (payload: object, options?: jwt.SignOptions): string => {
  return jwt.sign(payload, config.jwt.secret, options);
};

export const verifyJwt = (token: string): object | string => {
  return jwt.verify(token, config.jwt.secret);
};

export const decodeJwt = (token: string): object | null => {
  return jwt.decode(token) as object | null;
};
