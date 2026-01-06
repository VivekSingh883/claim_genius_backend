import { Router } from 'express';
import { validateBody } from '../../../middlewares/validation-middleware';
import {
  createCommonIssueController,
  getAllCommonIssuesController,
} from '../controllers/commonIssue-controller';
import { createCommonIssueSchema } from '../../../validations/commonIssue';
import { requestHandler } from '../../../middlewares/request-handler';

const router = Router();

router.post(
  '/',
  validateBody(createCommonIssueSchema),
  requestHandler(createCommonIssueController),
);

router.get('/', requestHandler(getAllCommonIssuesController));

export default router;
