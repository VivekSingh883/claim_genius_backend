import { prisma } from '../../../utils/prisma';
import { CreateCommentPayload } from '../../../types/comment';

export const createComment = async (payload: CreateCommentPayload) => {
  const { ticketId, userId, comment } = payload;

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    throw new Error('Ticket not found');
  }

  return prisma.comment.create({
    data: { ticketId, userId, comment },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
};

export const getCommentsByTicket = async (ticketId: number) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    throw new Error('Ticket not found');
  }

  return prisma.comment.findMany({
    where: { ticketId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
};

export const updateComment = async (commentId: number, userId: number, comment: string) => {
  const existingComment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!existingComment) {
    throw new Error('Comment not found');
  }

  if (existingComment.userId !== userId) {
    throw new Error('You are not authorized to update this comment');
  }

  return prisma.comment.update({
    where: { id: commentId },
    data: { comment, isEdited: true },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
};

export const deleteComment = async (commentId: number, userId: number) => {
  const existingComment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!existingComment) {
    throw new Error('Comment not found');
  }

  if (existingComment.userId !== userId) {
    throw new Error('You are not authorized to delete this comment');
  }

  return prisma.comment.delete({
    where: { id: commentId },
  });
};
