import { NextFunction, Request, RequestHandler, Response } from 'express';
import { DepartmentBodyRequest, DepartmentParamsRequest } from '../types/department';
import Joi from 'joi';
import { responseHandler } from '../middlewares/response-handler';
import logger from '../utils/logger';

//Validate department data using Joi schema
export const departmentValidation: RequestHandler = (
  req: Request<DepartmentParamsRequest, {}, DepartmentBodyRequest>,
  res: Response,
  next: NextFunction,
) => {
  const { name } = req.body;
  const { id } = req.params;

  const schema = Joi.object({
    name: Joi.string().required(),
    id: Joi.number().optional(),
  });

  const { error } = schema.validate({ name, id });

  if (error) {
    logger.error(`Validation error: ${error.details[0].message}`);
    return responseHandler(res, 400, false, 'Validation error: ' + error.details[0].message); // send to response handler middleware
  } else {
    next();
  }
};
