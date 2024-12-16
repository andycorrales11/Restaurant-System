import express = require('express');
import Duggbase from '../models/Duggbase';
import { Result, Client } from 'ts-postgres';
import { Request, Response } from 'express';
import { addOrderToDatabase, fillInventoryTable } from '../controllers/InventoryOrderingController';
import { adjustDatabase } from '../controllers/InventoryAdjustmentsController';

const app = express();
const port = 3001;
const router = express.Router();

//create endpoint at localhost:3001/api/inventory/:InventoryTable
router.get('/api/inventory/table', (req: Request, res: Response) => {
    //when a get request is sent to endpoint, call fucntion to get data from database
    fillInventoryTable(req, res);
});

router.post('/api/inventory/order', (req: Request, res: Response) => {
    addOrderToDatabase(req, res);
});

router.post('/api/inventory/adjustment', (req: Request, res: Response) => {
    adjustDatabase(req, res);
});

module.exports = router;