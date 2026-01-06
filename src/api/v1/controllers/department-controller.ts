import { Request, Response } from 'express';
import logger from '../../../utils/logger';
import {
  DepartmentBodyRequest,
  DepartmentParamsRequest,
  DepartmentQueryRequest,
  ResponseData,
} from '../../../types/department';
import {
  createDepartment,
  fetchDepartment,
  fetchDepartmentById,
  modifyDepartment,
  removeDepartment,
} from '../services/department-service';
import { responseHandler } from '../../../middlewares/response-handler';
import { HTTP_STATUS_CODES } from '../../../config/constants';

export const addDepartment = async (req: Request<{}, {}, DepartmentBodyRequest>, res: Response) => {
  const { name } = req.body;

  const newDepartment = await createDepartment(name); // calling service function to create department

  // console.log(newDepartment);
  logger.info(`Department ${name} added successfully with ID ${newDepartment.id}`);

  return responseHandler(
    res,
    HTTP_STATUS_CODES.CREATED,
    true,
    'Department added successfully',
    newDepartment,
  ); // sending response using response handler middleware
};

export const getAllDepartment = async (
  req: Request<{}, DepartmentQueryRequest, {}>,
  res: Response,
) => {
  const { search } = req.query;
  const departments = await fetchDepartment(search as string); // calling service function to fetch department
  logger.info(`Departments fetched successfully`);

  return responseHandler(
    res,
    HTTP_STATUS_CODES.OK,
    true,
    'Department fetched successfully',
    departments as ResponseData,
  );
};

export const getDepartmentById = async (
  req: Request<DepartmentParamsRequest, {}, {}>,
  res: Response,
) => {
  const { id } = req.params;

  const departmentById = await fetchDepartmentById(Number(id)); // calling service function to fetch department by id
  logger.info(`Department with id ${id} fetched successfully`);

  return responseHandler(
    res,
    HTTP_STATUS_CODES.OK,
    true,
    'Department fetched successfully',
    departmentById as ResponseData,
  );
};

export const updateDepartment = async (
  req: Request<DepartmentParamsRequest, {}, DepartmentBodyRequest>,
  res: Response,
) => {
  const { id } = req.params;
  const { name } = req.body;

  const updateDepartment = await modifyDepartment(Number(id), name); // calling service function to update department

  logger.info(`Department with id ${id} updated successfully`);

  return responseHandler(
    res,
    HTTP_STATUS_CODES.OK,
    true,
    'Department updated successfully',
    updateDepartment,
  );
};

export const deleteDepartment = async (
  req: Request<DepartmentParamsRequest, {}, {}>,
  res: Response,
) => {
  const { id } = req.params;

  const deleteDepartment = await removeDepartment(Number(id)); // calling service function to delete department
  logger.info(`Department with id ${id} deleted successfully`);

  return responseHandler(
    res,
    HTTP_STATUS_CODES.OK,
    true,
    'Department deleted successfully',
    deleteDepartment,
  );
};
