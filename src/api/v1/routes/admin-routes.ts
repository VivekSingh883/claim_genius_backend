import express from 'express';
import * as AdminController from '../controllers/admin-controller';
import { requestHandler } from '../../../middlewares/request-handler';
import { authorize } from '../../../middlewares/role-middleware';
import { PERMISSIONS } from '../../../types/permission';
import { validateBody } from '../../../middlewares/validation-middleware';

import { createDepartmentSchema, updateDepartmentSchema } from '../../../validations/admin';

const router = express.Router();

// Dashboard Summary
// router.get(
//   '/dashboard',
//   authorize([PERMISSIONS.TICKET_VIEW]),
//   requestHandler(AdminController.getDashboardStats),
// );

// Monthly Graph Stats API
// router.get(
//   '/monthly-stats',
//   authorize([PERMISSIONS.TICKET_VIEW]),
//   requestHandler(AdminController.getMonthlyStats),
// );

// Get department list with assignee + reviewers
router.get(
  '/departments',
  authorize([PERMISSIONS.TICKET_VIEW]),
  requestHandler(AdminController.getAdminDepartments),
);

// Get all assignee for dropdown
router.get(
  '/assignees',
  authorize([PERMISSIONS.TICKET_VIEW]),
  requestHandler(AdminController.getAssigneeForDepartment),
);

// CREATE — new department
router.post(
  '/departments',
  authorize([PERMISSIONS.TICKET_VIEW]),
  validateBody(createDepartmentSchema),
  requestHandler(AdminController.createAdminDepartment),
);

// UPDATE — department (all fields required)
router.put(
  '/departments/:id',
  authorize([PERMISSIONS.TICKET_VIEW]),
  validateBody(updateDepartmentSchema),
  requestHandler(AdminController.updateAdminDepartment),
);

// TOGGLE active/inactive
router.patch(
  '/departments/:id/toggle',
  authorize([PERMISSIONS.TICKET_VIEW]),
  requestHandler(AdminController.toggleDepartmentStatus),
);

export default router;
