import { RequestHandler } from "express";
import Duggbase from "../models/Duggbase";
import { Request, Response } from "express";
import { Menu_Item } from "../models/Menu_Item";

/**
 * Gets the list of menu items.
 * @param {Request} req - HTTP request
 * @param {Response} res - HTTP response with the list of menu items
 */
export const getMenuItems = async (req: Request, res: Response): Promise<void> => {
    const client = await Duggbase();
    const query = "SELECT uniqueid, name, product_code, premium, side, appetizer, drink FROM menu_items";
    try {
        const result = await client.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching menu items:", err);
        res.status(500).send({ error: "Failed to fetch menu items" });
    } finally {
        client.end();
    }
};

/**
 * Gets the list of active menu items.
 * @param {Request} req - HTTP request
 * @param {Response} res - HTTP response with the list of menu items
 */
export const getActiveMenuItems = async (req: Request, res: Response): Promise<void> => {
    const client = await Duggbase();
    const query = "SELECT uniqueid, name, product_code, premium, side, appetizer, drink FROM menu_items WHERE NOT removed";
    try {
        const result = await client.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching menu items:", err);
        res.status(500).send({ error: "Failed to fetch menu items" });
    } finally {
        client.end();
    }
};

/**
 * Gets menu item details by uniqueid.
 * @param {Request} req - HTTP request with menu item uniqueid as parameter
 * @param {Response} res - HTTP response with menu item data
 */
export const getMenuItemById = async (req: Request, res: Response): Promise<void> => {
    const client = await Duggbase();
    const query = `
        SELECT uniqueid, name, product_code, premium, side, appetizer, removed, drink
        FROM menu_items WHERE uniqueid = $1
    `;
    try {
        const result = await client.query(query, [req.params["id"]]);
        if (result.rows.length === 0) {
            res.status(404).send({ error: "Menu item not found" });
            return;
        }
        

        // console.log(result);
        const [id, name, prodcode, premium, side, appetizer, removed, drink] = result.rows[0];

        // Get ingredients
        const ingredientQuery = `
        SELECT
            inventory.uniqueid, inventory.description
        FROM ingredient
        JOIN menu_items ON menu_items.uniqueid = ingredient.menu_itemid
        JOIN inventory ON inventory.uniqueid = ingredient.inventoryid
        WHERE menu_items.uniqueid=$1
        `;
        const ingredientResult = client.query(ingredientQuery, [id]);

        res.json(Object.assign(new Menu_Item(id, prodcode, name, premium, side, drink, appetizer, []), {_ingredients: (await ingredientResult).rows.map((e) => [e[0], e[1]])}));
    } catch (err) {
        console.error("Error fetching menu item by uniqueid:", err);
        res.status(500).send({ error: "Failed to fetch menu item" });
    } finally {
        client.end();
    }
};

/**
 * Updates menu item details.
 * @param {Request} req - HTTP request with menu item data as body
 * @param {Response} res - HTTP response with update status
 */
export const updateMenuItem = async (req: Request, res: Response): Promise<void> => {
    const client = await Duggbase();
    const { _id, _name, _productCode, _premium, _side, _appetizer, _drink, _ingredients } = req.body;

    if (!_id || !_name || !_productCode) {
        res.status(400).send({ error: "Missing required fields: uniqueid, name, or product_code" });
        return;
    }

    const query = `
        UPDATE menu_items 
        SET name = $2, product_code = $3, premium = $4, side = $5, appetizer = $6, drink = $7
        WHERE uniqueid = $1
    `;

    const existingIngredientQuery = `
    DELETE FROM ingredient
    WHERE menu_itemid=$1
    `;

    try {
        const result = await client.query(query, [_id, _name, _productCode, _premium, _side, _appetizer, _drink]);

        await client.query(existingIngredientQuery, [_id]);
        if(_ingredients.length>0) {
            const insertIngredientQuery = `INSERT INTO ingredient (menu_itemid, inventoryid) VALUES `+_ingredients.map((ingredient:number) => `(${_id}, ${ingredient})`).join(', ');
            await client.query(insertIngredientQuery);
        }

        res.send({ success: true, data: result });
    } catch (err) {
        console.error("Error updating menu item:", err);
        res.status(500).send({ error: "Failed to update menu item" });
    } finally {
        client.end();
    }
};

/**
 * Marks a menu item as removed.
 * @param {Request} req - HTTP request with menu item uniqueid as parameter
 * @param {Response} res - HTTP response with update status
 */
export const markMenuItemRemoved = async (req: Request, res: Response): Promise<void> => {
    console.log("enters markmenuitemremoved");
    const client = await Duggbase();
    const _id = req.params["id"];

    console.log(_id);

    if (!_id) {
        res.status(400).send({ error: "Missing required field: uniqueid" });
        return;
    }

    const query = `
        UPDATE menu_items 
        SET removed = TRUE 
        WHERE uniqueid = $1;
    `;
    console.log(query, [_id]);
    try {
        const result = await client.query(query, [parseInt(_id)]);
        res.send({ success: true, data: result });
    } catch (err) {
        console.error("Error marking menu item as removed:", err);
        res.status(500).send({ error: "Failed to update menu item" });
    } finally {
        client.end();
    }
};

/**
 * Adds a new menu item.
 * @param {Request} req - HTTP request with menu item data as body
 * @param {Response} res - HTTP response with creation status
 */
export const addMenuItem: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const client = await Duggbase();
    const { _id, _name, _productCode, _premium, _side, _appetizer, _drink } = req.body;

    if (!_id || !_name || !_productCode) {
        res.status(400).send({ error: "Missing required fields: uniqueid, name, or product_code" });
        return;
    }

    const query = `
        INSERT INTO menu_items (uniqueid, name, product_code, premium, side, appetizer, removed, drink)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING uniqueid;
    `;
    try {
        const result = await client.query(query, [_id, _name, _productCode, _premium, _side, _appetizer, false, _drink]);
        res.send({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("Error adding new menu item:", err);
        res.status(500).send({ error: "Failed to add new menu item" });
    } finally {
        client.end();
    }
};
