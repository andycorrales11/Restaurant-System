import { Request, Response } from 'express';
import { Employee } from '../models/Employee';
import Duggbase from '../models/Duggbase';
import { Client, Result } from 'ts-postgres';

/**
 * Gets user data.
 * @param {Request} req - HTTP request with unique ID as body
 * @param {Response} res - HTTP response with employee data
 * @returns {Response} Error status
 */
export const getUser = async (req : Request, res : Response ) => {
    const { uniqueid } = req.body;
    if (!uniqueid) {
        return res.status(400).json({ error: "Missing required field: uniqueid" });
    }
    let client : Client | null = null;
    try {
        client = await Duggbase();
        const result: Result = await client.query("SELECT * FROM employees WHERE uniqueid = $1", [uniqueid]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Employee not found" });
        }
        const row = result.rows[0];
        const emp = new Employee(
            row.get('uniqueid') as number,
            row.get('manager') as boolean,
            row.get('name') as string,
            row.get('username') as string,
            row.get('terminated') as boolean
        );
        res.json(emp);
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ error: "Failed to fetch user" });
    } finally {
        if (client) {
            client.end();
        }
    }
};