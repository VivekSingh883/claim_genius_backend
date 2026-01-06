import logger from '../../../utils/logger';
import { prisma } from '../../../utils/prisma';

// add new department
export const createDepartment = async (name: string) => {
  const newDepartment = await prisma.department.create({
    data: {
      name,
      // initials,
      // issues: 'Common Issues',
    },
  });
  logger.info('Department created successfully: service');
  return newDepartment;
};

// fetch all departments
export const fetchDepartment = async (search: string = '') => {
  const departments = await prisma.department.findMany({
    where: {
      name: {
        contains: search,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      name: true,
      // initials: true,
    },
    orderBy: { name: 'asc' },
  });

  logger.info('Fetched departments successfully');

  return departments;
};

// fetch department by id
export const fetchDepartmentById = async (id: number) => {
  const departmentById = await prisma.department.findUnique({
    where: { id },
  });
  logger.info(`Department with id ${id} fetched successfully`);
  return departmentById;
};

// update department
export const modifyDepartment = async (id: number, name: string) => {
  const updatedDepartment = await prisma.department.update({
    where: { id },
    data: { name },
  });
  logger.info(`Department with id ${id} updated successfully`);
  return updatedDepartment;
};

//delete department
export const removeDepartment = async (id: number) => {
  const deletedDepartment = await prisma.department.delete({
    where: { id },
  });
  logger.info(`Department with id ${id} deleted successfully`);
  return deletedDepartment;
};
