export interface DepartmentBodyRequest {
  name: string;
  initials: string;
}

export interface DepartmentParamsRequest {
  id?: string;
}

export interface DepartmentQueryRequest {
  search?: string;
}

export interface ResponseData {
  name?: string;
  id?: number;
  issues?: string;
}
