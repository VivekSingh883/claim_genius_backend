import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';

// validation middleware for POST and PUT requests
export const validateBody =
  (schema: Joi.ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction): Response | void => {
    const dataToValidate = {
      ...req.params,
      ...req.query,
      ...req.body,
    };
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });
    if (error) {
      const errors = error.details.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      }));

      return errorResponse(res, 'Validation failed', 400, errors);
    }

    req.body = value;
    next();
  };
