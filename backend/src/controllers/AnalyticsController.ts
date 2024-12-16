import { Request, Response } from 'express';
import Duggbase from "../models/Duggbase";

/**
 * Gets daily sales data points from start and end date.
 * @param {Request} req - HTTP request with start and end date (both optional, defaults to last 7 days from today) as query
 * @param {Response} res - HTTP response with data points of format {date: (Date ISO string), sales: (Sales figure)}
 */
export const getSalesDataPoints = async (req:Request, res:Response) => {
    try {
        const db = await Duggbase();
        let response:Object[] = [];
        
        let endDate:Date = new Date(new Date(Date.now()).getTime()-new Date(Date.now()).getTimezoneOffset()*60000);
        let startDate:Date = new Date(endDate);
        startDate.setDate(startDate.getDate()-7);

        // Checks queries for start and end date
        if(Object.hasOwn(req.query, 'start')) startDate = new Date(req.query.start!.toString());
        if(Object.hasOwn(req.query, 'end')) endDate = new Date(req.query.end!.toString());

        const query = `
        SELECT 
            DATE(date_of_sale) AS sale_date, 
            SUM(order_total) AS sales
        FROM order_history
        WHERE date_of_sale BETWEEN '${startDate.toISOString().substring(0, startDate.toISOString().indexOf('T'))}T00:00:00' AND '${endDate.toISOString().substring(0, endDate.toISOString().indexOf('T'))}T23:59:59'
        GROUP BY DATE(date_of_sale)
        ORDER BY sale_date
        `;

        const result = await db.query(query)
        result.rows.forEach((e) => response.push({date: e[0].toISOString().substring(0, 10), sales: e[1]}));

        res.json(response);
        db.end();
    } catch (error) {
        console.error('Error fetching sales data points:', error);
        res.status(500).send('Internal Server Error');
    }
}

export const getInventoryDataPoints = async (req:Request, res:Response) => {
    try {
        const db = await Duggbase();
        let response:Object[] = [];

        let endDate:Date = new Date(new Date(Date.now()).getTime()-new Date(Date.now()).getTimezoneOffset()*60000);
        let startDate:Date = new Date(endDate);
        startDate.setDate(startDate.getDate()-7);

        // Checks queries for start and end date
        if(Object.hasOwn(req.query, 'start')) startDate = new Date(req.query.start!.toString());
        if(Object.hasOwn(req.query, 'end')) endDate = new Date(req.query.end!.toString());

        if(Object.hasOwn(req.query, 'inventoryid')) {
            let result = await db.query(`
            SELECT
                menu_items.uniqueid
            FROM ingredient
            JOIN menu_items ON menu_items.uniqueid = ingredient.menu_itemid
            WHERE ingredient.inventoryid=${req.query.inventoryid}
            `);
            
            if(result.rows.length!==0) {
                const uniqueIdWheres = result.rows.map((menuItem) => `sd.uniqueid=${menuItem[0]} OR e1.uniqueid=${menuItem[0]} OR e2.uniqueid=${menuItem[0]} OR e3.uniqueid=${menuItem[0]}`).join(' OR ');

                result = await db.query(`
                SELECT
                    DATE(order_history.date_of_sale) AS sale_date,
                    COUNT(items.uniqueid) AS quantity
                FROM order_history
                INNER JOIN item_in_order ON order_history.uniqueid=item_in_order.order_historyid
                INNER JOIN items ON item_in_order.itemid=items.uniqueid
                INNER JOIN menu_items sd ON sd.uniqueid = items.side
                INNER JOIN menu_items e1 ON e1.uniqueid = items.entree1
                INNER JOIN menu_items e2 ON e2.uniqueid = items.entree2
                INNER JOIN menu_items e3 ON e3.uniqueid = items.entree3
                WHERE
                    order_history.date_of_sale BETWEEN '${startDate.toISOString().substring(0, startDate.toISOString().indexOf('T'))}T00:00:00' AND '${endDate.toISOString().substring(0, endDate.toISOString().indexOf('T'))}T23:59:59'
                    AND (${uniqueIdWheres})
                GROUP BY DATE(order_history.date_of_sale)
                ORDER BY DATE(order_history.date_of_sale)
                `);

                result.rows.forEach((dataPoint) => {
                    response.push({date: dataPoint[0].toISOString().substring(0, 10), quantity: parseInt(dataPoint[1])});
                });
                res.json(response);
            }
            else {
                result = await db.query(`
                SELECT
                    item_type.uniqueid
                FROM supply
                JOIN item_type ON item_type.uniqueid = supply.item_typeid
                WHERE supply.inventoryid=${req.query.inventoryid}
                `);

                const uniqueIdWheres = result.rows.map((menuItem) => `item_type.uniqueid=${menuItem[0]}`).join(' OR ');

                result = await db.query(`
                SELECT
                    DATE(order_history.date_of_sale) AS sale_date,
                    COUNT(items.uniqueid) AS quantity
                FROM order_history
                INNER JOIN item_in_order ON order_history.uniqueid=item_in_order.order_historyid
                INNER JOIN items ON item_in_order.itemid=items.uniqueid
                INNER JOIN item_type ON item_type.uniqueid = items.item_t
                WHERE
                    order_history.date_of_sale BETWEEN '${startDate.toISOString().substring(0, startDate.toISOString().indexOf('T'))}T00:00:00' AND '${endDate.toISOString().substring(0, endDate.toISOString().indexOf('T'))}T23:59:59'
                    AND (${uniqueIdWheres})
                GROUP BY DATE(order_history.date_of_sale)
                ORDER BY DATE(order_history.date_of_sale)
                `);

                result.rows.forEach((dataPoint) => {
                    response.push({date: dataPoint[0].toISOString().substring(0, 10), quantity: parseInt(dataPoint[1])});
                });
                res.json(response);
            }

            db.end();
        }
        else {
            throw new Error('No inventory ID');
        }
    } catch (error) {
        console.error('Error fetching inventory data points:', error);
        res.status(500).send('Internal Server Error');
    }
}