import { prisma } from '../../../utils/prisma';
import { Prisma, Ticket } from '../../../generated/prisma/client';
import {
  TicketPriority,
  TicketStatus,
  TicketRequest,
  TicketFilters,
  TicketOrder,
  TicketWhere,
  TicketUpdateSchema,
  CreateTicketPayload,
} from '../../../types/ticket';
import { EmailService } from './email-service';
import { AppError } from '../../../utils/error';
import { HTTP_STATUS_CODES } from '../../../config/constants';

// Create a new ticket
export const createTicket = async (payload: CreateTicketPayload): Promise<Ticket> => {
  // 1️ Verify Department Exists
  const department = await prisma.department.findUnique({
    where: { id: payload.departmentId },
  });

  if (!department) {
    throw new AppError(
      `Department with ID ${payload.departmentId} not found`,
      HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  // 2️ Find Default Assignee with User Details
  const defaultAssignee = await prisma.assignee.findFirst({
    where: { departmentId: payload.departmentId, isDefault: true },
    include: { user: true },
  });

  if (!defaultAssignee) {
    throw new AppError(
      `No default assignee found for department ID ${payload.departmentId}`,
      HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  // get last created ticket
  const lastTicket = await prisma.ticket.findFirst({
    orderBy: { id: 'desc' },
  });

  // next ticket number
  const nextNumber = lastTicket ? parseInt(lastTicket.ticketNumber.replace('TKT-', '')) + 1 : 1;

  // format ticket to TKT-001, TKT-002 etc
  const formattedTicketNumber = `TKT-${nextNumber.toString().padStart(4, '0')}`;

  // 3️ Create Ticket with Default Assignee
  const ticket = await prisma.ticket.create({
    data: {
      ...payload,
      assigneeId: defaultAssignee.id,
      ticketNumber: formattedTicketNumber,
    },
    include: {
      department: true,
    },
  });

  // 4️ Send Email Notification to Assignee
  if (defaultAssignee.user?.email) {
    await EmailService.send(
      defaultAssignee.user.email,
      'New Ticket Assigned to You',
      `
        <p>Hello ${defaultAssignee.user.name || 'Assignee'},</p>
        <p>A new ticket has been assigned to you:</p>
        <ul>
          <li><b>Title:</b> ${ticket.title}</li>
          <li><b>Status:</b> ${ticket.status}</li>
          <li><b>Department:</b> ${department.name}</li>
        </ul>
        <p>Kindly check your dashboard for more details.</p>
      `,
    );
  }

  return ticket;
};

// Fetch all tickets with pagination + filters
export const getAllTickets = async (
  page: number,
  filters: TicketFilters = {},
  limit: number,
): Promise<{ tickets: Ticket[]; totalTickets: number; totalPages: number }> => {
  // const limit = page === 0 ? undefined : 10;
  const currentPage = page > 0 ? page : 1;
  // const skip = limit ? (currentPage - 1) * limit : undefined;
  const skip = (currentPage - 1) * limit;

  const where: TicketWhere = {};

  //  Title filter
  if (typeof filters.title === 'string') {
    where.title = filters.title;
  } else if (filters.title?.contains) {
    where.title = {
      contains: filters.title.contains,
      mode: filters.title.mode,
    };
  }

  if (filters.status) where.status = { in: filters.status };
  if (filters.priority) where.priority = { in: filters.priority };
  if (filters.userId) where.userId = filters.userId;
  if (filters.assigneeId) where.assigneeId = filters.assigneeId;
  // if (filters.departmentId) where.departmentId = { in: filters.departmentId };
  if (filters.departmentId) {
    const ids = Array.isArray(filters.departmentId) ? filters.departmentId : [filters.departmentId]; // convert single number to array

    where.departmentId = { in: ids };
  }

  if (filters.from || filters.to) {
    where.createdAt = {
      gte: filters.from ? new Date(filters.from) : undefined,
      lte: filters.to ? new Date(filters.to) : undefined,
    };
  }

  //  Your sort interface used
  const orderBy: TicketOrder = {
    createdAt: filters.sort === 'asc' ? 'asc' : 'desc',
  };

  const [tickets, totalTickets] = await Promise.all([
    prisma.ticket.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        department: { select: { id: true, name: true } },
        assignee: {
          select: {
            id: true,
            userId: true,
            user: { select: { name: true } },
          },
        },
        user: { select: { id: true, name: true } },
      },
    }),
    prisma.ticket.count({ where }),
  ]);

  const totalPages = limit ? Math.ceil(totalTickets / limit) : 1;

  return {
    totalTickets,
    tickets,
    totalPages,
  };
};

// Get ticket by ID
export const getTicketById = async (id: number): Promise<Ticket> => {
  const ticket = await prisma.ticket.findUnique({
    where: { id }, // Search ticket by ID
    include: {
      department: { select: { id: true, name: true } },
      assignee: {
        select: {
          id: true,
          userId: true,
          user: { select: { name: true } },
        },
      },
      user: { select: { id: true, name: true } },
    },
  });

  if (!ticket) throw new AppError(`Ticket with ID ${id} not found`, HTTP_STATUS_CODES.NOT_FOUND);
  return ticket; // Return found ticket
};

// update only status and priority
export const updateTicketStatusAndPriority = async (
  id: number,
  payload: TicketUpdateSchema,
): Promise<Ticket> => {
  return prisma.ticket.update({
    where: { id }, // Target ticket
    data: {
      status: payload.status,
      priority: payload.priority,
    },
  });
};

// Get department ID of the logged-in user

export const TicketService = {
  async getDepartmentIdByUserId(userId: number): Promise<number | null> {
    const record = await prisma.assignee.findFirst({
      where: { userId },
      select: { departmentId: true }, // or departmentId after rename
    });
    return record?.departmentId || null;
  },
};

//status update
export const updateTicketStatus = async (id: number, status: TicketStatus): Promise<Ticket> => {
  // 1️ Update the ticket and include creator (user)
  const updatedTicket = await prisma.ticket.update({
    where: { id },
    data: { status },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  // 2️ Send email notification to ticket creator
  if (updatedTicket.user?.email) {
    const subject = `Ticket #${updatedTicket.id} Status Updated`;
    const message = `Hello ${updatedTicket.user.name},<p style="text-align:justify font-size:21px">Your ticket "${updatedTicket.title}" status has been updated to "${status}".</p>Regards, <br/>GTix Support Team`;

    EmailService.send(updatedTicket.user.email, subject, message);
  }

  return updatedTicket;
};

//priority update
export const updateTicketPriority = async (
  id: number,
  priority: TicketPriority,
): Promise<Ticket> => {
  return prisma.ticket.update({
    where: { id },
    data: { priority },
  });
};

//update assigneeId
export const TicketAssignee = async (ticketId: number, assigneeId: number): Promise<Ticket> => {
  return prisma.ticket.update({
    where: { id: ticketId },
    data: { assigneeId },
  });
};

//Fetch all Assignees of the user’s department

export const findAssigneesByDepartment = async (departmentId: number) => {
  return prisma.assignee.findMany({
    where: { departmentId: departmentId },
    select: {
      id: true,
      isDefault: true,
      user: { select: { name: true } },
    },
  });
};

// Update ticket by ID

export const updateTicket = async (
  id: number,
  payload: Partial<TicketRequest>, // Accept partial update fields
): Promise<Ticket> => {
  return prisma.ticket.update({
    where: { id }, // Target ticket
    data: payload, // Apply updated values
  });
};

// Delete ticket by ID

export const deleteTicket = async (id: number): Promise<Ticket> => {
  return prisma.ticket.delete({
    where: { id }, // Delete ticket with matching ID
  });
};
