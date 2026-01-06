import crypto from 'crypto';
import { config } from '../config';

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-ctr', config.crypto.secret, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

export const decrypt = (hash: string): string => {
  const [ivStr, encryptedStr] = hash.split(':');
  const iv = Buffer.from(ivStr, 'hex');
  const encrypted = Buffer.from(encryptedStr, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-ctr', config.crypto.secret, iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString();
};
