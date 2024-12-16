import { Request, Response } from 'express';
import { Employee } from '../models/Employee';
import Duggbase from '../models/Duggbase';
import { Client, Result } from 'ts-postgres';
import { Order } from '../models/Order';

interface finishedOrder {
    orderNumber: number;
}

/**
 * Gets list of unfinished orders.
 * @param {Request} req - HTTP request
 * @param {Response} res - HTTP response with list of unfinished orders
 */
export const getUnfinishedOrders = async (req: Request, res: Response) => {
    const client : Client = await Duggbase();
    const orders : Result = await client.query("SELECT * FROM order_history WHERE finished = false");
    const tableData: any[] = [];
    //loop through orders
    for (const order of orders.rows) {
        const order_id = order.get('uniqueid');
        const date = order.get('date_of_sale');
        const query = "SELECT * FROM item_in_order WHERE order_historyid = $1";
        const items_in_order : Result = await client.query(query, [order_id]);
        //for each order, loop through the items in that order
        for (const item of items_in_order.rows) {
            const item_id = item.get('itemid');
            const query2 = "SELECT * FROM items WHERE uniqueid = $1";
            const item_list : Result = await client.query(query2, [item_id]);
            //for each item, figure out the meal items in that item
            for (const meal_item of item_list.rows) {
                const item_t = meal_item.get('item_t');
                const sideNum = meal_item.get('side');
                const entree1Num = meal_item.get('entree1');
                const entree2Num = meal_item.get('entree2');
                const entree3Num = meal_item.get('entree3');
                let isMeal = false;
                if (parseInt(item_t) > 0 && parseInt(item_t) <= 8) {
                    //meal_item is a meal, not a standalone item
                    isMeal = true;
                }
                const query3 = "SELECT * FROM menu_items WHERE uniqueid = $1";
                const side : Result = await client.query(query3, [sideNum]);
                const side_name = side.rows[0].get('name');
                const entree1 : Result = await client.query(query3, [entree1Num]);
                const entree1_name = entree1.rows[0].get('name');
                const entree2 : Result = await client.query(query3, [entree2Num]);
                const entree2_name = entree2.rows[0].get('name');
                const entree3 : Result = await client.query(query3, [entree3Num]);
                const entree3_name = entree3.rows[0].get('name');
                const query4 = "SELECT * FROM item_type WHERE uniqueid = $1";
                const item_type : Result = await client.query(query4, [item_t]);
                const item_type_name = item_type.rows[0].get('name');
                const row = {
                    orderid: order_id,
                    date: date,
                    itemid: item_id,
                    meal: isMeal,
                    item_type: item_type_name,
                    side: side_name,
                    entree1: entree1_name,
                    entree2: entree2_name,
                    entree3: entree3_name
                };
                tableData.push(row);
            }
        }  
    }
    res.json(tableData);
}

/**
 * Delclares order as finished with order ID.
 * @param {Request} req - HTTP request with finished order
 * @param {Response} res - HTTP response
 */
export const finishOrder = async (req: Request, res: Response) => {
    const client: Client = await Duggbase();
    const order: finishedOrder[] = req.body;
    const orderNum = order[0].orderNumber;
    let query = "UPDATE order_history SET finished = true WHERE uniqueid = $1";
    const result: Result = await client.query(query, [orderNum]);
}