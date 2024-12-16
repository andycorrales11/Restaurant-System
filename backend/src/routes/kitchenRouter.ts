import express = require('express');
import Duggbase from '../models/Duggbase';
import { Result, Client } from 'ts-postgres';
import { Request, Response } from 'express';
import { getUnfinishedOrders, finishOrder } from '../controllers/KitchenScreenController';

const router = express.Router();

router.get('/api/kitchenscreen/orders', (req: Request, res: Response) => {
    getUnfinishedOrders(req, res);
});

router.post('/api/kitchenscreen/finishorder', (req: Request, res: Response) => {
    finishOrder(req, res);
});

export default router;