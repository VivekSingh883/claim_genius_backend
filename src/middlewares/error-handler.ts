// middleware/error-handler.ts
import { ErrorRequestHandler } from 'express';
import { AppError } from '../utils/error';
import logger from '../utils/logger';
import { responseHandler } from './response-handler';
import { HTTP_STATUS_CODES } from '../config/constants';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`);

  if (err instanceof AppError) {
    return responseHandler(res, err.statusCode, false, err.message);
  }

  // Unexpected server error
  return responseHandler(
    res,
    HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    false,
    'Internal Server Error',
  );
};
