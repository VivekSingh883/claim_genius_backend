import { Request, Response } from 'express';
import { createCommonIssue, getAllCommonIssues } from '../services/commonIssue-service';
import { responseHandler } from '../../../middlewares/response-handler';
import { HTTP_STATUS_CODES } from '../../../config/constants';
import logger from '../../../utils/logger';

// Create Common Issue

export const createCommonIssueController = async (req: Request, res: Response): Promise<void> => {
  const payload = req.body;
  const issue = await createCommonIssue(payload);

  logger.info(` Common Issue created with ID: ${issue.id}`);

  responseHandler(res, HTTP_STATUS_CODES.CREATED, true, 'Common Issue created successfully', issue);
};

// Get All Common Issues (Optional departmentId filter)

export const getAllCommonIssuesController = async (req: Request, res: Response): Promise<void> => {
  const departmentId = req.query.departmentId ? Number(req.query.departmentId) : undefined;

  const issues = await getAllCommonIssues(departmentId);

  responseHandler(res, HTTP_STATUS_CODES.OK, true, 'Common Issues retrieved successfully', issues);
};
