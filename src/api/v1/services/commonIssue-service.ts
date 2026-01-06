import { prisma } from '../../../utils/prisma';
import { CreateCommonIssueRequest, CommonIssueResponse } from '../../../types/commonIssue';

// Create Common Issue
export const createCommonIssue = async (
  payload: CreateCommonIssueRequest,
): Promise<CommonIssueResponse> => {
  const { title, description, departmentId } = payload;

  const issue = await prisma.commonIssue.create({
    data: {
      title,
      description,
      departmentId,
    },
  });

  const commonIssue: CommonIssueResponse = {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    departmentId: issue.departmentId,
    createdAt: issue.createdAt.toISOString(),
  };

  return commonIssue;
};

//  Get All Common Issues (Filtered by departmentId if provided)
export const getAllCommonIssues = async (departmentId?: number): Promise<CommonIssueResponse[]> => {
  const issues = await prisma.commonIssue.findMany({
    where: departmentId ? { departmentId } : {}, //  filter applied if param exists
    orderBy: { id: 'desc' },
  });

  const commonIssues: CommonIssueResponse[] = issues.map(issue => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    departmentId: issue.departmentId,
    createdAt: issue.createdAt.toISOString(),
  }));

  return commonIssues;
};
