import { Request, Response } from 'express';
import { Employee } from '../models/Employee';
import Duggbase from '../models/Duggbase';
import { Client, Result } from 'ts-postgres';

/**
 * Represents an item in an inventory order
 */
interface InventoryItem {
    itemCode: string;
    description: string;
    unitCost: number;
    quantity: number;
    total: number;
}

/**
 * fillInventoryTable gets the inventory table information from the database
 * and stores it as an array, which it then puts in the res.body
 * @param {Request} req unused
 * @param {Response} res contains the array created from the database data
 */
export const fillInventoryTable = async (req: Request, res: Response) => {
    //gets data from database via query
    const client : Client = await Duggbase();
    const result : Result = await client.query("SELECT * FROM inventory ORDER BY uniqueid ASC");
    const tableData: any[] = [];
    //query returns bunch of rows, create array element for each row of data
    result.rows.forEach((element: any) => {
        const row = {
            itemCode: element.get('uniqueid'),
            description: element.get('description'),
            unitCost: element.get('unit_cost'),
            currentQTY: element.get('amount_on_hand'),
            neededQTY: element.get('amount_needed'),
            orderedQTY: element.get('amount_ordered'),
            input: '',
            button: 'Add to Order'
        };
        tableData.push(row);
    });
    //send tableData array to endpoint
    res.json(tableData);
}

/**
 * addOrderToDatabase updates the database with new inventory orders
 * @param {Request} req stores the details about what items have been ordered
 * @param {Response} res unused
 */
export const addOrderToDatabase = async (req: Request, res: Response) => {
    const client: Client = await Duggbase();
    const newOrder: InventoryItem[] = req.body;
    for (const item of newOrder) {
        //Update inventory_orders table
        let query = "INSERT INTO inventory_orders (order_total, unit_cost, quantity, date_of_sale, description, employee) VALUES ('";
        query += item.total.toFixed(2) + "', '";
        query += item.unitCost.toFixed(2) + "', '";
        query += item.quantity + "', '";
        const date = new Date();
        const month = String(date.getMonth() + 1).padStart(2,'0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        const dateString = `${month}/${day}/${year}`;
        query += dateString + "', '";
        query += item.description + "', '";
        query += '2' + "');"; //replace 2 with employee number
        const result: Result = await client.query(query);

        //update inventory table - amount_ordered
        const result2: Result = await client.query("SELECT amount_ordered FROM inventory WHERE description = '" + item.description + "';");
        let amountOrdered = result2.rows[0].get('amount_ordered') as number;
        amountOrdered += item.quantity;
        const result3: Result = await client.query("UPDATE inventory SET amount_ordered = " + amountOrdered.toString() + " WHERE description = '" + item.description + "';");
    }
}