import express from 'express';
import { updateEmployee, terminateEmployee, getEmployeeById, getEmployees, addEmployee } from '../controllers/EmployeeEditController'; 
import { Request, Response } from 'express';
const router = express.Router();

router.get('/', getEmployees);
router.post('/', addEmployee);
router.get('/:id', getEmployeeById);
router.put('/:id', updateEmployee); 
router.delete('/:id', terminateEmployee);

export default router;