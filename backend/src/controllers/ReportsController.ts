import { Request, Response } from 'express'
import Duggbase from '../models/Duggbase';

export const getXReport = async ( req : Request, res : Response ) : Promise<void> => {
    const response = await getNetSales()
    res.send({success: true, resp : response });
    return;
}

export const getZReport = async ( req : Request, res : Response ) : Promise<void> => {
    
    return;
}

const getNetSales = async (): Promise<number> => {
    const client = await Duggbase();
    const dateTime = new Date();
    const date = `${dateTime.getFullYear()}/${dateTime.getMonth() + 1}/${dateTime.getDate()}`
    const query = `
        SELECT SUM(order_total)
        FROM order_history
        WHERE date_of_sale > to_timestamp($1, 'YYYY-MM-DD')
    `;

    try {
        const res = await client.query(query, [date]);
        return res.rows[0].at(0) ? parseFloat(res.rows[0].at(0)) : 0;
    } catch (error) {
        console.error("Error fetching net sales:", error);
        throw error;
    } finally {
        await client.end();
    }
};


/* 
X-Report:

const merchandise = {
        netSales: 12345.67,
        returns: 0.00,
        total: 201983.03
    };
    
    const nonMerchandise = {
        tax: 235.56,
        payIns: 0.00,
        payOuts: 0.00,
        payOnAccounts: 0.00,
        total: 235.56
    };
    
    const salesByType = [
        { Meal: "Bowl", quantity: 123, total: 123.67 }
    ];
*/