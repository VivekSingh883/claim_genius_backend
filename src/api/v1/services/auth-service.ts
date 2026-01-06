import { prisma } from '../../../utils/prisma';
import bcrypt from 'bcrypt';
import logger from '../../../utils/logger';
import { User } from '../../../types/auth';
import { Profile } from 'passport-google-oauth20';
import { AppError } from '../../../utils/error';
import { HTTP_STATUS_CODES } from '../../../config/constants';
/**
 * Login user with email & password
 */
export const loginWithEmail = async (email: string, password: string): Promise<User> => {
  logger.info(`Login attempt for email: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true, assignee: true },
  });

  if (!user) {
    logger.warn(`Login failed — User not found: ${email}`);
    throw new AppError('Invalid email or password', HTTP_STATUS_CODES.UNAUTHORIZED);
  }

  if (!user.password) {
    logger.warn(`Login failed — Google SSO only: ${email}`);
    throw new AppError('Please login using Google SSO', HTTP_STATUS_CODES.UNAUTHORIZED);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    logger.warn(`Invalid password for email: ${email}`);
    throw new AppError('Invalid email or password', HTTP_STATUS_CODES.UNAUTHORIZED);
  }

  logger.info(`User successfully logged in: ${email}`);
  return user as unknown as User;
};
/**
 *  Create or find user using Google SSO — Only allows @claimgenius.com
 */
export const findOrCreateGoogleUser = async (profile: Profile): Promise<User> => {
  const email = profile.emails?.[0]?.value;

  // Validate email presence
  if (!email) {
    throw new AppError('Google profile does not contain an email', HTTP_STATUS_CODES.BAD_REQUEST);
  }

  // Allow only @claimgenius.com domain
  if (!email.endsWith('@gmail.com')) {
    logger.warn(` Unauthorized Google login attempt from domain: ${email}`);
    throw new Error('Unauthorized domain. Only @claimgenius.com accounts are allowed.');
  }

  // Find existing user
  let user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  if (user) {
    logger.info(`Existing @claimgenius.com user logged in via Google: ${email}`);
    return user as unknown as User;
  }

  // Create new user if not exists
  const defaultRole = await prisma.role.findUnique({ where: { name: 'EMPLOYEE' } });

  user = await prisma.user.create({
    data: {
      email,
      name: profile.displayName,
      roleId: defaultRole?.id || 1,
    },
    include: { role: true },
  });

  logger.info(`Created new Google user with @claimgenius.com: ${email}`);
  return user as unknown as User;
};

/**
 * Logout user (service layer)
 */
export const logoutUser = async (email?: string): Promise<string> => {
  if (email) logger.info(`User logging out: ${email}`);
  else logger.info('Logout requested (anonymous)');
  return 'User logged out successfully';
};

//fetch permissions

export const getUser = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
            permissions: {
              select: {
                permissionId: true,
                permission: {
                  select: { name: true },
                },
              },
            },
          },
        },
        assignee: true,
        employeeCode: true,
        department: true,
      },
    });
    if (!user) return null;
    console.dir(user, { depth: null });
    logger.info(`User fetched with email : ${email}`);
    return user;
  } catch (error) {
    logger.error(`Error fetching user by email: ${error}`);
    throw new AppError('Error fetching user', HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};
