/**
 * @file ticket.validation.ts
 * @description Joi schemas for Ticket module (Create + Update)
 */

import Joi from 'joi';

// Prisma-aligned enums
export const TicketStatusEnum = ['OPEN', 'INPROGRESS', 'PENDING', 'CLOSED'] as const;
export const TicketPriorityEnum = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

/**
 *  Create Ticket Validation Schema
 */
export const createTicketSchema = Joi.object({
  departmentId: Joi.number().integer().required().messages({
    'number.base': ' departmentId must be a number',
    'any.required': ' departmentId is required',
  }),

  assigneeId: Joi.number().integer().allow(null).optional(),

  assetType: Joi.string().optional().allow('', null),

  assetId: Joi.string().optional().allow('', null),

  issueType: Joi.string().optional().allow('', null),

  title: Joi.string().min(3).required().messages({
    'string.min': 'title must be at least 3 characters',
  }),

  description: Joi.string().min(5).required().messages({
    'string.min': 'description must be at least 5 characters',
  }),

  status: Joi.string()
    .valid(...TicketStatusEnum)
    .default('OPEN'),

  attachments: Joi.array().items(Joi.string()).default([]),
});

/**
 *  Update Ticket Schema
 * All fields optional
 */
export const updateTicketSchema = createTicketSchema.fork(
  Object.keys(createTicketSchema.describe().keys),
  schema => schema.optional(),
);

export const updateTicketParamsSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'Ticket ID must be a number.',
    'any.required': 'Ticket ID is required.',
  }),

  // Allow status and priority directly as query params
  status: Joi.string()
    .uppercase()
    .valid(...TicketStatusEnum)
    .optional()
    .messages({
      'any.only': `Invalid status value. Must be one of ${TicketStatusEnum.join(', ')}.`,
    }),

  priority: Joi.string()
    .uppercase()
    .valid(...TicketPriorityEnum)
    .optional()
    .messages({
      'any.only': `Invalid priority value. Must be one of ${TicketPriorityEnum.join(', ')}.`,
    }),
})
  // Require at least one of the updatable fields
  .or('status', 'priority', 'assigneeId');
