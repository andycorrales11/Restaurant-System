import express from 'express';
import { getActiveMenuItems, getMenuItems, addMenuItem, updateMenuItem, markMenuItemRemoved, getMenuItemById } from '../controllers/MenuItemEditController'; 
import { Request, Response } from 'express';
const router = express.Router();

router.get('/active', getActiveMenuItems);
router.get('/all', getMenuItems);
router.get('/:id', getMenuItemById);
router.post('/', addMenuItem);
router.put('/:id', updateMenuItem);
router.delete('/:id', markMenuItemRemoved);

export default router