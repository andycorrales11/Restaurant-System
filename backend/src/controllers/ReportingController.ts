import { Request, response, Response } from 'express';
import Duggbase from "../models/Duggbase";

/**
 * Gets reporting data for X-report and Z-report.
 * @param {Request} req - HTTP request
 * @param {Response} res - HTTP response with reporting data
 */
export const getReportingData = async (req:Request, res:Response) => {
    try {
        const db = await Duggbase();
        let response = {};

        // Timestamp generation
        let result = await db.query("SELECT created FROM log WHERE type='zreport' ORDER BY created DESC LIMIT 1");
        // The long current date retrieval is the result of not saving timezones
        const generatedTimestamp:Date = new Date(new Date(Date.now()).getTime()-new Date(Date.now()).getTimezoneOffset()*60000);
        let zReportTimestamp:Date = new Date(generatedTimestamp);
        if(result.rows.length!==0) {
            zReportTimestamp = new Date(result.rows[0][0]);
        }
        else {
            zReportTimestamp.setDate(zReportTimestamp.getDate()-1);
        }
        Object.assign(response, {zReportTimestamp: zReportTimestamp.toISOString(), generatedTimestamp: generatedTimestamp.toISOString()});


        // Sales total generation
        const SALES_TAX_RATE = 0.0825;
        // ts-postgres does not allow ROUND() and ::NUMERIC
        let query = `SELECT SUM(order_total) AS sales FROM order_history WHERE date_of_sale BETWEEN $1 AND $2`;
        result = await db.query(query, [zReportTimestamp, generatedTimestamp]);
        const netSales = result.rows[0][0];
        Object.assign(response, {
            merchandise: {
                netSales: netSales,
                returns: 0,
                total: netSales
            },
            nonmerchandise: {
                tax: netSales*(1+SALES_TAX_RATE),
                payIns: 0,
                payOuts: 0,
                payOnAccounts: 0,
                total: netSales*(1+SALES_TAX_RATE)
            }
        });


        // Sales itemization generation

        // Create category list
        let menuItemTypeList = {"Side": [""], "Entree": [""], "Appetizer": [""]};
        result = await db.query("SELECT name FROM menu_items WHERE side AND name!='None'");
        menuItemTypeList.Side = result.rows.map((e) => e[0]);

        result = await db.query("SELECT name FROM menu_items WHERE (NOT (side OR appetizer)) AND name!='None'");
        menuItemTypeList.Entree = result.rows.map((e) => e[0]);

        result = await db.query("SELECT name FROM menu_items WHERE appetizer AND name!='None'");
        menuItemTypeList.Appetizer = result.rows.map((e) => e[0]);

        // Get all menu items and quantity
        query = `
        SELECT 
            UNNEST(ARRAY[sd.name, e1.name, e2.name, e3.name]) AS menu_item, COUNT(items.uniqueid) AS quantity
        FROM order_history 
        INNER JOIN item_in_order ON order_history.uniqueid=item_in_order.order_historyid 
        INNER JOIN items ON item_in_order.itemid=items.uniqueid 
        INNER JOIN menu_items sd ON sd.uniqueid = items.side 
        INNER JOIN menu_items e1 ON e1.uniqueid = items.entree1 
        INNER JOIN menu_items e2 ON e2.uniqueid = items.entree2 
        INNER JOIN menu_items e3 ON e3.uniqueid = items.entree3 
        WHERE order_history.date_of_sale BETWEEN $1 AND $2
        GROUP BY UNNEST(ARRAY[sd.name, e1.name, e2.name, e3.name]) 
        ORDER BY COUNT(items.uniqueid)
        `;
        result = await db.query(query, [zReportTimestamp, generatedTimestamp]);
        const menuItemEntries = Object.fromEntries(result.rows);

        // Sorting by category
        let salesByCategory = {Side: {}, Entree: {}, Appetizer: {}};
        for(const [key, val] of Object.entries(menuItemTypeList)) {
            val.forEach((e) => {
                if(Object.hasOwn(menuItemEntries, e)) {
                    Object.assign(salesByCategory[key as keyof Object], {[e]: Number(menuItemEntries[e])})
                }
            });
        }
        Object.assign(response, {salesByCategory: salesByCategory});

        // Getting fixed item type list
        const itemTypeGroupList = {
            "Meal": {
                "Bowl": ["bowl"],
                "Plate": ["plate"],
                "Bigger Plate": ["bigger_plate"]
            },
            "Other": {
                "A La Carte": ["small_entree", "medium_entree", "large_entree", "medium_side", "large_side"],
                "Appetizer": ["roll", "large_roll", "rangoon", "large_rangoon", "small_apple", "med_apple", "large_apple"],
                "Drink": ["small_drink", "med_drink", "large_drink", "water_bottle", "gatorade"]
            }
        }

        query = `
        SELECT
            item_type.name, COUNT(items.uniqueid) AS quantity, COUNT(items.uniqueid)*item_type.price AS sales
        FROM order_history
        INNER JOIN item_in_order ON order_history.uniqueid=item_in_order.order_historyid
        INNER JOIN items ON item_in_order.itemid=items.uniqueid
        INNER JOIN item_type ON item_type.uniqueid = items.item_t
        WHERE order_history.date_of_sale BETWEEN $1 AND $2
        GROUP BY item_type.name, item_type.price
        ORDER BY COUNT(items.uniqueid)
        `;
        result = await db.query(query, [zReportTimestamp, generatedTimestamp]);
        const itemTypeEntries = Object.fromEntries(result.rows.map((e) => [e[0], {quantity: e[1], sales: e[2]}]));
        let salesByType = {};

        // Sorting by item type
        let quant = 0;
        let sales = 0.0;
        for(const [itemTypeCategory, itemTypeList] of Object.entries(itemTypeGroupList)) {
            let salesByTypeCategory = {}
            for(const [key, val] of Object.entries(itemTypeList)) {
                quant = 0;
                sales = 0.0;
                val.forEach((e) => {
                    if(Object.hasOwn(itemTypeEntries, e)) {
                        quant+=Number(itemTypeEntries[e].quantity);
                        sales+=itemTypeEntries[e].sales;
                    }
                });
                let salesByTypeEntry = {quantity: quant, total: sales};
                if(itemTypeCategory==="Other") Object.assign(salesByTypeEntry, {weightedAvg: sales/quant});
                Object.assign(salesByTypeCategory, {[key]: salesByTypeEntry});
            }
            Object.assign(salesByType, {[itemTypeCategory]: salesByTypeCategory});
        }
        Object.assign(response, {salesByType: salesByType});

        if(Object.hasOwn(req.query, 'zreport')&&req.query.zreport=='true') {
            query = `INSERT INTO log (created, type) VALUES ($1, 'zreport')`;
            db.query(query, [generatedTimestamp]);
        }

        res.json(response);
    } catch (error) {
        console.error('Error fetching reporting data:', error);
        res.status(500).send('Internal Server Error');
    }
};

/**
 * Gets hourly quantity and sales data for the day.
 * @param {Request} req - HTTP request
 * @param {Response} res - HTTP response with list of data points of format {quantity: (Sold quantity), sales: (Sales figures)} with index representing hour
 */
export const getHourlyData = async (req:Request, res:Response) => {
    try {
        const db = await Duggbase();
        let response:Object[] = [];

        let generatedDate:string = new Date(new Date(Date.now()).getTime()-new Date(Date.now()).getTimezoneOffset()*60000).toISOString();
        generatedDate = generatedDate.substring(0, 10);
        const query = `
        SELECT 
            EXTRACT(hour FROM date_of_sale) AS hour, COUNT(uniqueid) AS quantity, SUM(order_total) AS sales 
        FROM order_history 
        WHERE DATE_TRUNC('day', date_of_sale)::DATE='${generatedDate}'::DATE 
        GROUP BY EXTRACT(hour FROM date_of_sale) 
        ORDER BY EXTRACT(hour FROM date_of_sale)
        `;
        const result = await db.query(query);
        for(let i=0;i<24;i++) {
            response.push({quantity: 0, sales: 0});
        }
        result.rows.forEach((e) => response[e[0]] = {quantity: Number(e[1]), sales: e[2]});

        res.json(response);
        db.end();
    } catch (error) {
        console.error('Error fetching hourly sales and quantity:', error);
        res.status(500).send('Internal Server Error');
    }
}

export const getOrderHistory = async (req:Request, res:Response) => {
    try {
        const db = await Duggbase();
        let response:Object[] = [];

        const query = `
        SELECT
            order_history.uniqueid, order_history.date_of_sale, employees.name, order_total
        FROM order_history
        JOIN employees ON order_history.employee=employees.uniqueid
        WHERE DATE(order_history.date_of_sale)='${new Date(Date.now()).toISOString().substring(0, 10)}'
        ORDER BY order_history.date_of_sale DESC;
        `;
        const result = await db.query(query);
        result.rows.forEach((e) => response.push({uniqueid: e[0], dateOfSale: e[1], name: e[2], total: e[3]}));

        res.json(response);
        db.end();
    } catch (error) {
        console.error('Error fetching hourly sales and quantity:', error);
        res.status(500).send('Internal Server Error');
    }
}