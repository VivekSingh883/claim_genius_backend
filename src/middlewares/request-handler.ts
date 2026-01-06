import { NextFunction, Request, RequestHandler, Response } from 'express';
import { AsyncController } from '../types/common';

export const requestHandler = (fn: AsyncController): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
};
