import { Request, Response } from 'express';
import logger from '../../../utils/logger';
import {
  createComment,
  deleteComment,
  getCommentsByTicket,
  updateComment,
} from '../services/comment-service';
import { responseHandler } from '../../../middlewares/response-handler';
import { HTTP_STATUS_CODES } from '../../../config/constants';
import { UserPayload } from '../../../types/auth';
import { CreateCommentPayload } from '../../../types/comment';

// Create Comment
export const createCommentController = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as UserPayload | undefined;
  const userId = user?.id;

  if (!userId) {
    responseHandler(res, HTTP_STATUS_CODES.UNAUTHORIZED, false, 'User not authenticated');
    return;
  }

  const payload: CreateCommentPayload = {
    ...req.body,
    userId,
  };

  const newComment = await createComment(payload);

  logger.info(`Comment added successfully to ticket ${payload.ticketId} by user ${userId}`);

  responseHandler(res, HTTP_STATUS_CODES.CREATED, true, 'Comment added successfully', newComment);
};

// Get Comments by Ticket
export const getCommentsByTicketController = async (req: Request, res: Response): Promise<void> => {
  const ticketId = Number(req.params.ticketId);

  const comments = await getCommentsByTicket(ticketId);

  logger.info(`Comments fetched successfully for ticket ${ticketId}`);

  responseHandler(res, HTTP_STATUS_CODES.OK, true, 'Comments fetched successfully', comments);
};

// Update Comment
export const updateCommentController = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as UserPayload | undefined;
  const userId = user?.id;

  if (!userId) {
    responseHandler(res, HTTP_STATUS_CODES.UNAUTHORIZED, false, 'User not authenticated');
    return;
  }

  const commentId = Number(req.params.commentId);
  const { comment } = req.body;

  const updatedComment = await updateComment(commentId, userId, comment);

  logger.info(`Comment ${commentId} updated successfully by user ${userId}`);

  responseHandler(res, HTTP_STATUS_CODES.OK, true, 'Comment updated successfully', updatedComment);
};

// Delete Comment
export const deleteCommentController = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as UserPayload | undefined;
  const userId = user?.id;

  if (!userId) {
    responseHandler(res, HTTP_STATUS_CODES.UNAUTHORIZED, false, 'User not authenticated');
    return;
  }

  const commentId = Number(req.params.commentId);

  await deleteComment(commentId, userId);

  logger.info(`Comment ${commentId} deleted successfully by user ${userId}`);

  responseHandler(res, HTTP_STATUS_CODES.OK, true, 'Comment deleted successfully', null);
};
