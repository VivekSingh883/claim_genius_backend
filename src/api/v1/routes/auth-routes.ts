import express from 'express';
import {
  googleLogin,
  googleCallback,
  emailLogin,
  logout,
  getCurrentUser,
} from '../controllers/auth-controller';
import { authMiddleware } from '../../../middlewares/auth-middleware';
// import { roleMiddleware } from '../../../middlewares/role-middleware';
import { requestHandler } from '../../../middlewares/request-handler';
import { validateBody } from '../../../middlewares/validation-middleware';
import { emailLoginSchema } from '../../../validations/auth';

const router = express.Router();

/**
 * =========================================
 *  AUTH ROUTES
 * =========================================
 */

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login using email and password (returns JWT + redirect URL)
 * @access  Public
 */
router.post('/login', validateBody(emailLoginSchema), requestHandler(emailLogin));

/**
 * @route   GET /api/v1/auth/google
 * @desc    Initiate Google OAuth flow
 * @access  Public
 */
router.get('/google', googleLogin);

/**
 * @route   GET /api/v1/auth/google/callback
 * @desc    Google OAuth callback — handles Google SSO login + RBAC redirect
 * @access  Public
 */
router.get('/google/callback', requestHandler(googleCallback));

router.get('/me', authMiddleware, getCurrentUser);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user (clears JWT cookie)
 * @access  Protected
 */
router.post('/logout', authMiddleware, requestHandler(logout));

export default router;
