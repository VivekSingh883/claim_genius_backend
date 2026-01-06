// utils/app-error.ts
import { HTTP_STATUS_CODES } from '../config/constants';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = HTTP_STATUS_CODES.BAD_REQUEST) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
