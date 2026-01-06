import { Request, Response } from 'express';
import passport from 'passport';
import { loginWithEmail, logoutUser } from '../services/auth-service';
import { signJwt, verifyJwt } from '../../../utils/jwt';
import { decrypt, encrypt } from '../../../utils/crypto';
import { responseHandler } from '../../../middlewares/response-handler';
import { RequestUser, UserPayload } from '../../../types/auth';
import { config } from '../../../config';
import logger from '../../../utils/logger';
import { HTTP_STATUS_CODES } from '../../../config/constants';

const DEVELOPMENT_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://yourfrontend.com';

/**
 * Redirect user to Google OAuth login.
 */
export const googleLogin = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

const getDashboardRedirect = (role: string): string => {
  const base = config.env === 'development' ? DEVELOPMENT_URL : PRODUCTION_URL;

  switch (role.toUpperCase()) {
    case 'ADMIN':
      return `${base}/admin/dashboard`;
    case 'EMPLOYEE':
      return `${base}/dashboard/`;
    case 'ASSIGNEE':
      return `${base}/dashboard/`;
    case 'REVIEWER':
      return `${base}/dashboard/`;
    default:
      return `${base}/dashboard/`; // default fallback
  }
};

/**
 * Google OAuth callback handler (no RBAC redirect)
 */
export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  passport.authenticate('google', { session: false }, (err, user: UserPayload) => {
    if (err || !user) {
      logger.warn(`Google authentication failed: ${err?.message}`);
      return res.redirect(
        `${config.env === 'development' ? DEVELOPMENT_URL : PRODUCTION_URL}/auth/login-page`,
      );
    }

    const token = signJwt(user, { expiresIn: '1d' });
    const encryptedToken = encrypt(token);

    res.cookie('jwt', encryptedToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      // domain: 'localhost',
      maxAge: 24 * 60 * 60 * 1000,
    });

    logger.info(`Google login successful for ${user.email}`);
    return res.redirect(getDashboardRedirect(user.role || ''));
    // responseHandler(res, HTTP_STATUS_CODES.OK, true, 'Login successful', {
    //   user,
    // });
  })(req, res);
};

/**
 * Email & password login (no role redirection)
 */
export const emailLogin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    responseHandler(res, HTTP_STATUS_CODES.BAD_REQUEST, false, 'Email and password are required');
    return;
  }

  const user = await loginWithEmail(email, password);
  const payload: UserPayload = {
    id: user.id,
    email: user.email,
    role: user.role.name,
    name: user.name,
    assigneeId: user.assignee?.[0]?.id || null, // if exists
    employeeCode: user.employeeCode || null,
    department: {
      id: user.department?.id || 0,
      name: user.department?.name || '',
    },
  };

  const token = signJwt(payload, { expiresIn: '1d' });
  const encryptedToken = encrypt(token);

  res.cookie('jwt', encryptedToken, {
    httpOnly: true,
    // secure: config.env === 'production',
    secure: false,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });

  logger.info(`Email login successful for ${email}`);

  responseHandler(res, HTTP_STATUS_CODES.OK, true, 'Login successful', {
    user: payload,
  });
  // return res.redirect(getDashboardRedirect(payload.role || ''));
};

export const getCurrentUser = (req: Request, res: Response): void => {
  const user = req.user as RequestUser; // set by authenticate()
  if (!user) {
    return responseHandler(res, HTTP_STATUS_CODES.UNAUTHORIZED, false, 'User not authenticated');
  }
  console.log('userLogin', user);
  responseHandler(res, HTTP_STATUS_CODES.OK, true, 'User logged in', user);
};

/**
 * Logout user (service-driven)
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as UserPayload;

  await logoutUser(user?.email);

  res.clearCookie('jwt', {
    sameSite: 'lax',
    secure: false,
    domain: 'localhost',
  });

  responseHandler(res, HTTP_STATUS_CODES.OK, true, 'Logged out successfully');
};
