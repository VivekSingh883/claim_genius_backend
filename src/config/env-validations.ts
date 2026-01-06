import Joi from 'joi';
import logger from '../utils/logger';
import { EnvironmentVariables } from '../types/common';

// Definition of Joi schema for env validation
const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),

  PORT: Joi.number().default(process.env.PORT || 3000),

  // DATABASE_URL: Joi.string()
  //   .uri()
  //   .required()
  //   .messages({ 'any.required': 'DATABASE_URL is required' }),

  JWT_SECRET: Joi.string().min(10).required().messages({
    'string.min': 'JWT_SECRET must be at least 10 characters long',
    'any.required': 'JWT_SECRET is required',
  }),

  CRYPTO_SECRET: Joi.string().min(8).required().messages({
    'string.min': 'CRYPTO_SECRET must be at least 8 characters long',
    'any.required': 'CRYPTO_SECRET is required',
  }),

  GOOGLE_CLIENT_ID: Joi.string().optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().optional(),
  GOOGLE_CALLBACK_URL: Joi.string().optional(),
}).unknown(true);

// Validate process.env against schema
const { error, value } = envSchema.validate(process.env, {
  abortEarly: false,
  convert: true,
});

if (error) {
  logger.error(`Environment variable validation failed: ${error.message}`);
  process.exit(1);
}

// Export validated & typed environment variables
export const env = value as EnvironmentVariables;
