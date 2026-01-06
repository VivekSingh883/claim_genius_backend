import { Router } from 'express';

import * as userController from '../controllers/user-controller';
import { authMiddleware } from '../../../middlewares/auth-middleware';
import { authorize } from '../../../middlewares/role-middleware';
import { requestHandler } from '../../../middlewares/request-handler';
import { validateBody } from '../../../middlewares/validation-middleware';
import { profileSchema } from '../../../validations/user';

const router = Router();

// Only employees can update their own profile
router.put('/', validateBody(profileSchema), requestHandler(userController.updateUserProfile));

// Only admins and employees can view any user's profile
router.get('/', requestHandler(userController.getUser));

export default router;
