import { Request, Response } from 'express';
import { responseHandler } from '../../../middlewares/response-handler';
import { HTTP_STATUS_CODES } from '../../../config/constants';

export const getHealthStatus = async (req: Request, res: Response): Promise<void> => {
  const healthData = {
    uptime: process.uptime(),
    status: 'healthy',
    timestamp: new Date().toISOString(),
  };

  return responseHandler(res, HTTP_STATUS_CODES.OK, true, 'API v1 is running', healthData);
};
