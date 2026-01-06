import Joi from 'joi';

export const createCommonIssueSchema = Joi.object({
  departmentId: Joi.number().required(),
  title: Joi.string().min(2).required(),
  description: Joi.string().min(5).required(),
});

export const updateCommonIssueSchema = createCommonIssueSchema.fork(
  Object.keys(createCommonIssueSchema.describe().keys),
  schema => schema.optional(),
);
