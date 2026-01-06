import Joi from 'joi';

// Allow alphanumeric, common punctuation, and spacing
// Allowed: letters, numbers, spaces, and special chars: . , ! ? ; : ' " ( ) - & @
const commentPattern = /^[a-zA-Z0-9\s.,!?;:'"()\-&@]+$/;

export const createCommentSchema = Joi.object({
  ticketId: Joi.number().required(),
  comment: Joi.string()
    .min(1)
    .max(1000)
    .pattern(commentPattern)
    .messages({
      'string.pattern.base':
        'Comment contains invalid special characters. Only . , ! ? ; : \' " ( ) - & @ are allowed',
      'string.max': 'Comment cannot exceed 1000 characters',
    })
    .required(),
});

export const updateCommentSchema = Joi.object({
  comment: Joi.string()
    .min(1)
    .max(1000)
    .pattern(commentPattern)
    .messages({
      'string.pattern.base':
        'Comment contains invalid special characters. Only . , ! ? ; : \' " ( ) - & @ are allowed',
      'string.max': 'Comment cannot exceed 1000 characters',
    })
    .required(),
});
