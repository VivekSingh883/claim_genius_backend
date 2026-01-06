import { Router } from 'express';
import * as TicketController from '../controllers/ticket-controller';
import { validateBody } from '../../../middlewares/validation-middleware';
import { createTicketSchema, updateTicketSchema } from '../../../validations/ticket';
import { requestHandler } from '../../../middlewares/request-handler';
import { authMiddleware } from '../../../middlewares/auth-middleware';
import { authorize } from '../../../middlewares/role-middleware';
import { PERMISSIONS } from '../../../types/permission';

// Initialize Express router
const router = Router();

router.post(
  '/',
  authMiddleware,
  authorize([PERMISSIONS.TICKET_CREATE]),
  validateBody(createTicketSchema),
  requestHandler(TicketController.createTicket),
);

router.get(
  '/',
  authMiddleware,
  authorize([PERMISSIONS.TICKET_VIEW]),
  requestHandler(TicketController.getAllTickets),
);

router.get(
  '/:id',
  authMiddleware,
  authorize([PERMISSIONS.TICKET_VIEW]),
  requestHandler(TicketController.getTicketById),
);

router.get(
  '/:assigneeId',
  authMiddleware,
  authorize([PERMISSIONS.TICKET_VIEW]),
  requestHandler(TicketController.getTicketById),
);

//get assignee names
router.get(
  '/assignees/department',
  authMiddleware,
  authorize([PERMISSIONS.ASSIGNEE_VIEW]),
  requestHandler(TicketController.getAssigneesByDepartment),
);

//update status, priority and assigneeId
router.put(
  '/:id',
  authMiddleware,
  authorize([PERMISSIONS.TICKET_STATUS_CHANGE]),
  validateBody(updateTicketSchema),
  requestHandler(TicketController.updateTicketData),
);

//router.put("/:id",validateBody(updateTicketSchema),requestHandler(TicketController.updateTicket)
//);

//router.delete("/:id", requestHandler(TicketController.deleteTicket));

export default router;
