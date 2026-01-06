// Payload stored in JWT and request.user
export interface UserPayload {
  id: number;
  email: string;
  role?: string; // optional since RBAC removed
  name?: string | null;
  assigneeId: number | null;
  employeeCode: string | null;
  department: {
    id: number;
    name: string;
  };
}

// Basic user type used during login and profile fetching
export interface User {
  id: number;
  name?: string | null;
  email: string;
  password?: string | null;
  employeeCode?: string | null;
  roleId: number;
  departmentId?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  role: {
    id: number;
    name: string;
  };
  department?: {
    id: number;
    name: string;
  } | null;
  assignee: UserPayload[];
}

// Login request body
export interface LoginRequest {
  email: string;
  password: string;
}

// Auth response format (for login, SSO)
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: UserPayload;
    redirectTo?: string;
  };
}

// Google OAuth profile structure
export interface GoogleProfile {
  id: string;
  displayName: string;
  emails?: Array<{ value: string; verified?: boolean }>;
}

// Request User Type
export interface RequestUser {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  employeeCode: string;
  department: {
    id: number;
    name: string;
  };
}
