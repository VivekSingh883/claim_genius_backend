import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt';
import { decrypt } from '../utils/crypto';
import { RequestUser, UserPayload } from '../types/auth';
import { getUser } from '../api/v1/services/auth-service';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const encryptedToken = req.cookies?.jwt;

  if (!encryptedToken) {
    throw new Error('Encrypted token not present');
  }

  const token = decrypt(encryptedToken);
  const decoded = verifyJwt(token) as UserPayload;

  // console.log(decoded)
  const user = await getUser(decoded.email); //get all permissions using email
  // console.log(user)
  if (!user) {
    throw new Error('User not found');
  }

  // Extract permission names
  const permissionNames = user.role.permissions.map(p => p.permission.name);

  //Attach to req.user
  req.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role.name,
    permissions: permissionNames,
    assigneeId: decoded.assigneeId,
    employeeCode: user.employeeCode,
    department: user.department,
  } as RequestUser;
  // console.log(req.user)
  // req.user = decoded;
  next();
};
