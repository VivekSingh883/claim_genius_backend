import { TicketPriority, TicketStatus } from '../types/ticket';

export interface AdminTicketStats {
  totalTickets: number;
  resolvedTickets: number;
  pendingTickets: number;
  openTickets: number;
}

export interface AdminDepartmentAssignee {
  id: number;
  isDefault: boolean;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface AdminDepartmentReviewer {
  id: number;
  isDefault: boolean;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface AdminDepartmentItem {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  assignee: AdminDepartmentAssignee[];
  reviewers: AdminDepartmentReviewer[];
}

export interface AdminPaginatedDepartments {
  totalDepartments: number;
  departments: AdminDepartmentItem[];
}
