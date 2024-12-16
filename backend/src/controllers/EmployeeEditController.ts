import { RequestHandler } from "express";
import Duggbase from "../models/Duggbase";
import { Request, Response } from 'express';
import { Employee } from "../models/Employee";

/**
 * Gets list of employees.
 * @param {Request} req - HTTP request
 * @param {Response} res - HTTP response with list of employee ID
 */
export const getEmployees = async ( req : Request, res : Response ): Promise<void> => {
    const client = await Duggbase();
    const query = 'SELECT uniqueid FROM employees WHERE terminated = $1';
    const result = await client.query(query, [false]);

    res.json(result);
}

/**
 * Gets employee data. May be used in conjuction with getEmployees to get all employee information.
 * @param {Request} req - HTTP request with employee ID as parameter
 * @param {Response} res - HTTP response with employee data
 */
export const getEmployeeById = async ( req : Request, res : Response): Promise<void>=> {
    const client = await Duggbase();
    const query = 'SELECT uniqueid, manager, name, email, terminated, kiosk FROM employees WHERE uniqueid = $1';
    const result = await client.query(query, [req.params["id"]]);

    if (result.rows.length === 0) return;

    const [empId, manager, name, email, terminated, kiosk] = result.rows[0];
    // console.log("Kiosk value from query:", kiosk);
    // console.log(empId); why was it printing all of em omg
    res.json(new Employee(empId, manager, name, email, terminated, kiosk));
}

/**
 * Updates employee data.
 * @param {Request} req - HTTP request with employee information (id, manager, name, username, terminated) as body
 * @param {Response} res - HTTP response with update status
 */
export const updateEmployee = async ( req : Request, res : Response): Promise<void> => {
    const client = await Duggbase();
    const uniqueid = req.body["_id"];
    const manager = req.body["_manager"];
    const name = req.body["_name"];
    const email= req.body["_email"];
    const terminated = req.body["_terminated"];
    const kiosk = req.body["_kiosk"];

    console.log(uniqueid, manager, name, email, terminated, kiosk)
    if (!uniqueid || !name || !email) {
        res.status(400).send({ error: "Missing required field" });
    }
    try {
        new Employee(uniqueid, manager, name, email, false, kiosk);
    }
    catch (err) {
        console.error("Request is invalid: ", err);
    }
    const query = 
    `
    UPDATE employees 
    SET manager=$4, name=$2, email=$3, terminated=$5, kiosk=$6 
    WHERE uniqueid=$1
    `
    try {
        const resp = await client.query(query, [uniqueid, name, email, manager,terminated, kiosk]);
        res.send({ success: true, data: resp });
    } catch (err) {
        console.error("Error updating employee:", err);
        res.status(500).send({ error: "Failed to update employee" });
    } finally {
        client.end();
    }
}

/**
 * Gets employee data. May be used in conjuction with getEmployees to get all employee information.
 * @param {Request} req - HTTP request with employee ID as parameter
 * @param {Response} res - HTTP response with update status
 */
export const terminateEmployee = async ( req : Request, res : Response ): Promise<void> => {
    const client = await Duggbase();
    const uniqueid = req.params["id"];
    if (!uniqueid) {
        res.status(400).send({ error: "Missing required field: uniqueid" });
    }
    const query =
    `
    UPDATE employees
    SET terminated = $1
    WHERE uniqueid = $2
    `
    try {
        const resp = await client.query(query, [true, uniqueid]);
        res.send({ success: true, data: resp });
    } catch (err) {
        console.error("Error terminating employee:", err);
        res.status(500).send({ error: "Failed to terminate employee" });
    } finally {
        client.end();
    }

}

export const addEmployee: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const client = await Duggbase();
    const id = req.body["_id"];
    const manager = req.body["_manager"];
    const name = req.body["_name"];
    const email= req.body["_email"];
    const terminated = req.body["_terminated"];
    const kiosk = req.body["_kiosk"];

    // Validate required fields
    if (!id || !name || !email) {
        res.status(400).send({ error: "Missing required fields: id, name, and email" });
        return;
    }

    // Insert query
    const query = `
        INSERT INTO employees (uniqueid, name, email, manager, terminated, kiosk)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING uniqueid;
    `;

    try {
        // Execute the query
        const result = await client.query(query, [id, name, email, manager, terminated, kiosk]);
        console.log(req.body);
        res.send({ success: true, data: result });
    } catch (err) {
        console.error("Error adding new employee:", err);
        res.status(500).send({ error: "Failed to add new employee" });
    } finally {
        client.end();
    }
};