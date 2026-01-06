import Joi from 'joi';

/**
 * 🧾 Validation schema for email/password login
 */
export const emailLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),

  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
});

/**
 * ✅ Validation schema for Google OAuth callback (optional)
 */
export const googleCallbackSchema = Joi.object({
  token: Joi.string().optional(),
});
