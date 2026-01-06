import { NextFunction, Request, Response } from 'express';
import { Prisma } from '../generated/prisma';

// Ticket creation request body
export interface TicketRequest {
  departmentId: number;
  assetType: string;
  assetId: string;
  issueType: string;
  title: string;
  description: string;
  attachments?: string[];
}
export interface CreateTicketPayload extends TicketRequest {
  userId: number;
}

// Title search
export interface TicketTitleFilter {
  contains: string;
  mode: 'insensitive';
}

// Allowed values
export type TicketStatus = 'OPEN' | 'INPROGRESS' | 'PENDING' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Filters for query params
export interface TicketFilters {
  status?: TicketStatus[];
  priority?: TicketPriority[];
  userId?: number;
  assigneeId?: number;
  departmentId?: number | number[];
  title?: string | TicketTitleFilter;
  from?: string;
  to?: string;
  sort?: 'asc' | 'desc';
}

// Order by createdAt
export interface TicketOrder {
  createdAt: 'asc' | 'desc';
}

// Date range
export interface CreatedAtFilter {
  gte?: Date;
  lte?: Date;
}

// Where clause for prisma
export interface TicketWhere {
  status?: TicketStatus | Prisma.EnumTicketStatusFilter;
  priority?: TicketPriority | Prisma.EnumTicketPriorityFilter;
  userId?: number;
  departmentId?: number | Prisma.IntFilter;
  assigneeId?: number;
  title?: string | TicketTitleFilter;
  createdAt?: CreatedAtFilter;
}

// Update ticket (status + priority only)
export interface TicketUpdateSchema {
  id: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  assigneeId?: number;
}

//  Pagination Response Type
export interface Pagination {
  totalTickets: number;
  totalPages: number;
  currentPage: number;
  ticketPerPage: number;
  nextPage: number | null;
  prevPage: number | null;
}
