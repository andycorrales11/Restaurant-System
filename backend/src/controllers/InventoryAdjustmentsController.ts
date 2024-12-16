import { Request, Response } from "express";
import Duggbase from "../models/Duggbase";
import { Client, Result } from "ts-postgres";

/**
 * Represents an item being adjusted
 */
interface AdjustmentItem {
    itemCode: string;
    description: string;
    currentQTY: number;
    adjustedQTY: number;
}

/**
 * adjustDatabase updates the amount on hand in the database for whatever items
 * are stored in the req.body
 * @param {Request} req stores details about the items being adjusted
 * @param {Response} res unused
 */
export const adjustDatabase = async (req: Request, res: Response) => {
    const client: Client = await Duggbase();
    const newAdjustment: AdjustmentItem[] = req.body;
    for (const item of newAdjustment) {
        let query = "UPDATE inventory SET amount_on_hand = " + item.adjustedQTY.toString() + " WHERE description = '" + item.description + "';";
        const result: Result = await client.query(query);
    }
}

/**
 * receiveInventory updates the inventory table to add all ordered
 * inventory to amount on hand
 * @param {Request} req contains info about the items that have an ordered quantity
 * @param {Response} res unused
 */
export const receiveInventory = async (req: Request, res: Response) => {
    const client: Client = await Duggbase();
    const newAdjustment: AdjustmentItem[] = req.body;
    for (const item of newAdjustment) {
        let query = "UPDATE inventory SET amount_on_hand = " + item.adjustedQTY.toString() + ", amount_ordered = 0 WHERE description = '" + item.description + "';";
        const result: Result = await client.query(query);
    }
}