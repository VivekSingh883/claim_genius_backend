import { Request, Response } from 'express';
import { getUserById, profileUpdate } from '../services/user-service';
import logger from '../../../utils/logger';
import { HTTP_STATUS_CODES } from '../../../config/constants';
import { responseHandler } from '../../../middlewares/response-handler';
import { fetchDepartmentById } from '../services/department-service';
import { UserPayload } from '../../../types/auth';
import { UpdateProfile } from '../../../types/user';

//get specific user profile
export const getUser = async (req: Request, res: Response) => {
  const user = req.user as UserPayload | undefined;
  const userId = user?.id;

  if (!userId) {
    responseHandler(res, HTTP_STATUS_CODES.UNAUTHORIZED, false, 'User not authenticated');
    return;
  }

  const currentUser = await getUserById(userId);
  let userDepartment: { name: string } | null = null;
  let firstName = '';
  let lastName = '';
  if (currentUser?.departmentId) {
    userDepartment = await fetchDepartmentById(currentUser.departmentId);
  }
  if (user?.name) {
    const nameArray = user.name.trim().split(' ');
    firstName = nameArray[0];
    lastName = nameArray.slice(1).join(' ') || '';
  }
  const profileData = {
    employeeCode: currentUser?.employeeCode,
    email: user.email,
    firstName,
    lastName,
    department: userDepartment ? userDepartment.name : null,

    //roleType
    //profile image
  };
  logger.info(`user having id ${userId} fetched properly`);
  responseHandler(res, HTTP_STATUS_CODES.OK, true, 'user is fetched properly', profileData);
};

//update user details
export const updateUserProfile = async (req: Request, res: Response) => {
  const user = req.user as UserPayload | undefined;
  const userId = user?.id;

  if (!userId) {
    responseHandler(res, HTTP_STATUS_CODES.UNAUTHORIZED, false, 'User not authenticated');
    return;
  }
  const { employeeCode, departmentId }: UpdateProfile = req.body;
  const updateUser = {
    employeeCode,
    departmentId: departmentId,
  };
  const updatedUserData = await profileUpdate(userId, updateUser);
  logger.info(`User profile having id ${userId} updated successfully`);
  responseHandler(
    res,
    HTTP_STATUS_CODES.OK,
    true,
    'User profile updated successfully',
    updatedUserData,
  );
};
