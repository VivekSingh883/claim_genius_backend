import Joi from 'joi';

/**
 * CREATE Department – minimal & required
 */
export const createDepartmentSchema = Joi.object({
  name: Joi.string().trim().required(),
  defaultAssigneeId: Joi.number().required(),
  assignees: Joi.array().items(Joi.number()).min(1).required(),
  // defaultReviewerId: Joi.number().required(),
});

/**
 * UPDATE Department – ALL fields REQUIRED
 */
export const updateDepartmentSchema = Joi.object({
  name: Joi.string().trim().required(),
  defaultAssigneeId: Joi.number().required(),
  assignees: Joi.array().items(Joi.number()).min(1).required(),
  // defaultReviewerId: Joi.number().required(),
});
