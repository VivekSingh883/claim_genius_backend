import Joi from 'joi';

export const profileSchema = Joi.object({
  employeeCode: Joi.string().trim().alphanum().optional().messages({
    'string.alphanum': 'employeeCode must be alphanumeric (letters and numbers only)',
  }),

  departmentId: Joi.number().integer().positive().optional().messages({
    'number.base': 'departmentId must be a valid number',
    'number.integer': 'departmentId must be an integer',
    'number.positive': 'departmentId must be a positive value',
  }),
});
