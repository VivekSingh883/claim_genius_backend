import { Request, Response } from 'express';
import * as TicketService from '../services/ticket-service';
import { responseHandler } from '../../../middlewares/response-handler';
import {
  TicketRequest,
  TicketFilters,
  TicketStatus,
  TicketPriority,
  CreateTicketPayload,
} from '../../../types/ticket';
import { UserPayload } from '../../../types/auth';
import logger from '../../../utils/logger';
import { HTTP_STATUS_CODES } from '../../../config/constants';

/**
 * Create Ticket (User auto fetched from JWT)
 */
export const createTicket = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as UserPayload | undefined;
  const userId = user?.id;

  if (!userId) {
    responseHandler(res, HTTP_STATUS_CODES.UNAUTHORIZED, false, 'User not authenticated');
    return;
  }

  const payload: CreateTicketPayload = {
    ...req.body,
    userId,
  };

  const ticket = await TicketService.createTicket(payload);

  logger.info(`Ticket created by user ${userId}, ID: ${ticket.id}`);

  responseHandler(res, HTTP_STATUS_CODES.CREATED, true, 'Ticket created successfully', ticket);
};

/**
 * Get All Tickets (With Filters + Pagination)
 */
export const getAllTickets = async (req: Request, res: Response): Promise<void> => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 10;

  const filters: TicketFilters = {
    status: req.query.status ? (String(req.query.status).split(',') as TicketStatus[]) : undefined,
    priority: req.query.priority
      ? (String(req.query.priority).split(',') as TicketPriority[])
      : undefined,
    sort: (req.query.sort as 'asc' | 'desc') || 'desc',
  };

  if (req.query.title) {
    filters.title = {
      contains: String(req.query.title),
      mode: 'insensitive',
    };
  }

  if (req.query.userId) filters.userId = Number(req.query.userId);
  if (req.query.assigneeId) filters.assigneeId = Number(req.query.assigneeId);
  if (req.query.departmentId) {
    filters.departmentId = String(req.query.departmentId).split(',').map(Number); // convert "1,3" → [1,3]
  }

  if (req.query.from || req.query.to) {
    filters.from = req.query.from as string;
    filters.to = req.query.to as string;
  }

   // Admin -> remove filters
  const user = req.user as UserPayload;
  if (user.role === 'ADMIN') {
    delete filters.assigneeId;
    delete filters.userId;
    delete filters.departmentId;
  }

  const { tickets, totalTickets } = await TicketService.getAllTickets(page, filters, limit);

  logger.info(`Fetched ${tickets.length} tickets`);

  responseHandler(res, HTTP_STATUS_CODES.OK, true, 'Tickets fetched successfully', {
    totalTickets,
    tickets,
  });
  // responseHandler(res, HTTP_STATUS_CODES.OK, true, 'Tickets fetched successfully', tickets);
};

/**
 * Get Ticket By ID
 */
export const getTicketById = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  if (Number.isNaN(id) || id <= 0)
    throw { statusCode: HTTP_STATUS_CODES.BAD_REQUEST, message: 'Invalid ticket ID' };

  const ticket = await TicketService.getTicketById(id);

  logger.info(`Fetched ticket with ID: ${ticket.id}`);

  responseHandler(res, HTTP_STATUS_CODES.OK, true, 'Ticket fetched successfully', ticket);
};

/**
 * Update Only Status and Priority
 */
// export const updateTicketStatusAndPriority = async (req: Request, res: Response): Promise<void> => {
//   const id = Number(req.params.id);
//   if (Number.isNaN(id) || id <= 0)
//     throw { statusCode: HTTP_STATUS_CODES.BAD_REQUEST, message: 'Invalid ticket ID' };

//   const payload = req.body;

//   const ticket = await TicketService.updateTicketStatusAndPriority(id, payload);

//   logger.info(`Updated ticket (status/priority) ID: ${ticket.id}`);

//   responseHandler(
//     res,
//     HTTP_STATUS_CODES.OK,
//     true,
//     'Ticket status and priority updated successfully',
//     ticket,
//   );
// };
/**
 * Update Status, priority and assignee
 */
export const updateTicketData = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  if (Number.isNaN(id) || id <= 0) {
    throw {
      statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      message: 'Invalid ticket ID',
    };
  }

  const status = req.query.status as TicketStatus;
  const priority = req.query.priority as TicketPriority;

  let updatedTicket: TicketRequest | undefined;

  if (status) {
    const tickets = await TicketService.updateTicketStatus(id, status);
    updatedTicket = tickets as TicketRequest;
    logger.info(`Ticket ${id} status updated to ${status}`);
  }

  if (priority) {
    const tickets = await TicketService.updateTicketPriority(id, priority);
    updatedTicket = tickets as TicketRequest;
    logger.info(`Ticket ${id} priority updated to ${priority}`);
  }

  return responseHandler(
    res,
    HTTP_STATUS_CODES.OK,
    true,
    'Ticket updated successfully',
    updateTicket,
  );
};

/*
 * get assignee datails
 */
export const getAssigneesByDepartment = async (req: Request, res: Response): Promise<void> => {
  //  const userId = req.user?.id;

  // if (!userId) {
  //   throw {
  //     statusCode: HTTP_STATUS_CODES.UNAUTHORIZED,
  //     message: "User not authenticated",
  //   };
  // }

  // // Get department ID from service
  // const departmentId = await TicketService.getDepartmentIdByUserId(userId);

  const departmentId = 2; // Assuming JWT sets req.user

  if (!departmentId) {
    throw {
      statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      message: 'Department ID missing in user info',
    };
  }

  const assignees = await TicketService.findAssigneesByDepartment(departmentId);

  return responseHandler(
    res,
    HTTP_STATUS_CODES.OK,
    true,
    'Assignees fetched successfully',
    assignees,
  );
};

/**
 * Update Ticket (Any Fields)
 */
export const updateTicket = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  if (Number.isNaN(id) || id <= 0)
    throw { statusCode: HTTP_STATUS_CODES.BAD_REQUEST, message: 'Invalid ticket ID' };

  const payload: Partial<TicketRequest> = req.body;

  const ticket = await TicketService.updateTicket(id, payload);

  logger.info(`Updated ticket with ID: ${ticket.id}`);

  responseHandler(res, HTTP_STATUS_CODES.OK, true, 'Ticket updated successfully', ticket);
};

/**
 * Delete Ticket
 */
export const deleteTicket = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  if (Number.isNaN(id) || id <= 0)
    throw { statusCode: HTTP_STATUS_CODES.BAD_REQUEST, message: 'Invalid ticket ID' };

  const ticket = await TicketService.deleteTicket(id);

  logger.info(`Deleted ticket with ID: ${ticket.id}`);

  responseHandler(res, HTTP_STATUS_CODES.OK, true, 'Ticket deleted successfully', ticket);
};
