import { Request, Response, NextFunction } from 'express';
import { RequestUser } from '../types/auth';

export const authorize = (requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as RequestUser; // set by authenticate()

    if (!user) {
      throw new Error('Unauthorized');
    }
    // Normalize permissions to lowercase for case-insensitive check
    const userPermissions = user.permissions.map(p => p.toLowerCase());
    const allowed = requiredPermissions.some(p => {
      if (typeof p !== 'string') return false; // safety check
      return userPermissions.includes(p.toLowerCase());
    });

    // console.log("Required Permissions:", requiredPermissions);
    // console.log("User Permissions:", user.permissions);

    if (!allowed) {
      throw new Error('Access denied');
    }

    next();
  };
};
