import express from 'express';
import { validateBody } from '../../../middlewares/validation-middleware';
import { requestHandler } from '../../../middlewares/request-handler';
import {
  createCommentController,
  getCommentsByTicketController,
  updateCommentController,
  deleteCommentController,
} from '../controllers/comment-controller';
import { createCommentSchema, updateCommentSchema } from '../../../validations/comment';

const router = express.Router();

router.post('/', validateBody(createCommentSchema), requestHandler(createCommentController));

router.get('/:ticketId', requestHandler(getCommentsByTicketController));

router.put(
  '/:commentId',
  validateBody(updateCommentSchema),
  requestHandler(updateCommentController),
);
router.delete('/:commentId', requestHandler(deleteCommentController));

export default router;
