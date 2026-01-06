import express from 'express';
import {
  addDepartment,
  deleteDepartment,
  getAllDepartment,
  getDepartmentById,
  updateDepartment,
} from '../controllers/department-controller';
import { requestHandler } from '../../../middlewares/request-handler';
import { departmentValidation } from '../../../validations/department';

const router = express.Router();

router.post('/', departmentValidation, requestHandler(addDepartment));

router.get('/', requestHandler(getAllDepartment));

router.get('/:id', requestHandler(getDepartmentById));

router.put('/:id', departmentValidation, requestHandler(updateDepartment));

router.delete('/:id', departmentValidation, requestHandler(deleteDepartment));

export default router;
