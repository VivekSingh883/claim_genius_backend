import { prisma } from '../../../utils/prisma';
import { UpdateProfile } from '../../../types/user';

//find user in the database
export const getUserById = async (userId: number) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      employeeCode: true,
      departmentId: true,
      //roleType: true,
      //profile: true
    },
  });
};

//profile update
export const profileUpdate = async (userId: number, updatedUser: UpdateProfile) => {
  if (updatedUser.employeeCode) {
    const existing = await prisma.user.findFirst({
      where: {
        employeeCode: updatedUser.employeeCode,
        id: { not: userId },
      },
    });

    if (existing) {
      throw new Error(`Employee code already exists ${existing.employeeCode}`);
    }
  }
  return await prisma.user.update({
    where: { id: userId },
    data: { departmentId: updatedUser.departmentId, employeeCode: updatedUser.employeeCode },
    include: {
      department: true,
    },
  });
};
