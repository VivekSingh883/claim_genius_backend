import { Request, Response } from 'express';
import * as AdminService from '../services/admin-service';
import { responseHandler } from '../../../middlewares/response-handler';
import { HTTP_STATUS_CODES } from '../../../config/constants';
import logger from '../../../utils/logger';

/**
 * GET /admin/dashboard
 */
// export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
//   logger.info('Fetching admin dashboard stats');
//   const stats = await AdminService.getAdminDashboardStats();
//   logger.info('Dashboard stats fetched successfully');
//   responseHandler(res, HTTP_STATUS_CODES.OK, true, 'Dashboard stats fetched successfully', stats);
// };

/**
 * GET /admin/monthly-stats (Graph Data)
 */
// export const getMonthlyStats = async (req: Request, res: Response): Promise<void> => {
//   logger.info('Fetching admin monthly stats');
//   const graphData = await AdminService.getMonthlyStats();
//   responseHandler(
//     res,
//     HTTP_STATUS_CODES.OK,
//     true,
//     'Admin monthly ticket stats fetched successfully',
//     graphData,
//   );
// };

/* GET /admin/departments
 * Get department list with assignees + reviewers
 */
export const getAdminDepartments = async (req: Request, res: Response): Promise<void> => {
  logger.info('Fetching admin departments list');

  const page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
  const limit = req.query.limit ? Math.max(1, Number(req.query.limit)) : 10;
  const search = req.query.search ? String(req.query.search) : undefined;
  const sortBy = req.query.sortBy ? String(req.query.sortBy) : 'id';
  const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

  const data = await AdminService.getAdminDepartments(page, limit, search, sortBy, sortOrder);
  logger.info('Admin departments fetched successfully');

  responseHandler(res, HTTP_STATUS_CODES.OK, true, 'Admin departments fetched successfully', data);
};

/**
 * GET /admin/assignees
 * Dropdown list for creating new department
 */
export const getAssigneeForDepartment = async (req: Request, res: Response): Promise<void> => {
  logger.info('Fetching employees for admin department creation');
  const users = await AdminService.getAllAssigneeForDept();
  logger.info('Assignee fetched successfully for admin department creation');
  responseHandler(
    res,
    HTTP_STATUS_CODES.OK,
    true,
    'Assignee fetched successfully for admin department creation',
    users,
  );
};

/**
 * POST /admin/departments
 * Create new department with assignees
 */
export const createAdminDepartment = async (req: Request, res: Response): Promise<void> => {
  logger.info('Creating new department');

  const { name, defaultAssigneeId, assignees } = req.body;

  const dept = await AdminService.createAdminDepartment(name, defaultAssigneeId, assignees);

  responseHandler(res, HTTP_STATUS_CODES.CREATED, true, 'Department created successfully', dept);
};

// Update department
export const updateAdminDepartment = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  logger.info(`Updating department ID: ${id} by admin`);
  const { name, defaultAssigneeId, assignees, defaultReviewerId } = req.body;

  const dept = await AdminService.updateAdminDepartment(
    id,
    name,
    defaultAssigneeId,
    assignees,
    defaultReviewerId,
  );
  logger.info(`Department ID: ${id} updated successfully by admin`);
  responseHandler(res, HTTP_STATUS_CODES.OK, true, 'Department updated successfully', dept);
};

// TOGGLE ACTIVE/INACTIVE STATUS
export const toggleDepartmentStatus = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  logger.info(`Toggling active/inactive status for department ID: ${id} by admin`);
  const data = await AdminService.toggleDepartmentActivation(id);
  logger.info(`Department ID: ${id} status toggled successfully by admin`);
  responseHandler(res, HTTP_STATUS_CODES.OK, true, 'Department status toggled successfully', data);
};
