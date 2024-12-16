import express = require('express');
import Duggbase from '../models/Duggbase';
import { Result, Client } from 'ts-postgres';
import { Request, Response } from 'express';
import { addOrderToDatabase, fillInventoryTable } from '../controllers/InventoryOrderingController';
import { adjustDatabase, receiveInventory } from '../controllers/InventoryAdjustmentsController';

const router = express.Router();

/**
 * creates an endpoint that contains the inventory table data
 */
router.get('/api/inventory/table', (req: Request, res: Response) => {
    fillInventoryTable(req, res);
});

/**
 * creates an endpoint that contains new inventory order information
 */
router.post('/api/inventory/order', (req: Request, res: Response) => {
    addOrderToDatabase(req, res);
});

/**
 * creates an endpoint that contains new inventory adjustment information
 */
router.post('/api/inventory/adjustment', (req: Request, res: Response) => {
    adjustDatabase(req, res);
});

/**
 * creates an endpoint that contains inventory items that have an ordered quantity
 */
router.post('/api/inventory/receiveInventory', (req: Request, res: Response) => {
    receiveInventory(req, res);
})

export default router;