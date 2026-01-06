// request payload
export interface CreateCommonIssueRequest {
  title: string;
  description: string;
  departmentId: number;
}

// response type
export interface CommonIssueResponse {
  id: number;
  title: string;
  description: string;
  departmentId: number;
  createdAt: string;
}
