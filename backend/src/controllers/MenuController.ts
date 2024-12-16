import { Request, response, Response } from 'express';
import Duggbase from "../models/Duggbase";
import { Menu_Item } from '../models/Menu_Item';

/**
 * Gets all menu items.
 * @param {Request} req - HTTP request
 * @param {Response} res - HTTP response with list of menu items split by category
 */
export const getMenuItems = async (req:Request, res:Response) => {
    try {
        const db = await Duggbase();
        let response = {entree: new Array<Object>(), side: new Array<Object>(), appetizer: new Array<Object>(), drink: new Array<Object>()};

        const result = await db.query("SELECT uniqueid, name, product_code, premium, side, appetizer, drink, blob FROM menu_items WHERE uniqueid!=0 AND NOT removed");
        result.rows.forEach((e) => {
            // If side
            if(e[4]) {
                response.side.push(Object.assign({
                    uniqueid: e[0],
                    name: e[1],
                    premium: e[3],
                    blob: e[7],
                    available_sizes: {
                        medium: "medium_side",
                        large: "large_side"
                    }
                }, e[2]==="NONE" ? {} : {menu_code: e[2]}));
            }
            // If appetizer
            else if(e[5]) {
                let available_sizes = {};
                if(e[0]===19) {
                    available_sizes = {
                        small: "rangoon",
                        large: "large_rangoon"
                    }
                }
                else if(e[0]===20) {
                    available_sizes = {
                        small: "small_apple",
                        medium: "med_apple",
                        large: "large_apple"
                    }
                }
                else {
                    available_sizes = {
                        small: "roll",
                        large: "large_roll"
                    }
                }

                response.appetizer.push(Object.assign({
                    uniqueid: e[0],
                    name: e[1],
                    premium: e[3],
                    blob: e[7],
                    available_sizes: available_sizes
                }, e[2]==="NONE" ? {} : {menu_code: e[2]}));
            }
            // If drink
            else if(e[6]) {
                let available_sizes = {};
                if(e[0]===997) {
                    available_sizes = {
                        medium: "gatorade"
                    }
                }
                else if(e[0]===998) {
                    available_sizes = {
                        medium: "water_bottle"
                    }
                }
                else {
                    available_sizes = {
                        small: "small_drink",
                        medium: "med_drink",
                        large: "large_drink"
                    }
                }

                response.drink.push(Object.assign({
                    uniqueid: e[0],
                    name: e[1],
                    premium: e[3],
                    blob: e[7],
                    available_sizes: available_sizes
                }, e[2]==="NONE" ? {} : {menu_code: e[2]}));
            }
            // If entree
            else {
                response.entree.push(Object.assign({
                    uniqueid: e[0],
                    name: e[1],
                    premium: e[3],
                    blob: e[7],
                    available_sizes: {
                        small: "small_entree",
                        medium: "medium_entree",
                        large: "large_entree"
                    }
                }, e[2]==="NONE" ? {} : {menu_code: e[2]}));
            }
        });

        res.json(response);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).send('Internal Server Error');
    }
}

/**
 * Gets all item types.
 * @param {Request} req - HTTP request
 * @param {Response} res - HTTP response with list of item types
 */
export const getItemTypes = async (req:Request, res:Response) => {
    try {
        const db = await Duggbase();
        let response:Object = {};

        const result = await db.query("SELECT uniqueid, name, price FROM item_type WHERE uniqueid!=0");
        result.rows.forEach((e) => {
            Object.assign(response, {
                [e[1]]: {
                    uniqueid: e[0],
                    price: e[2]
                }
            });
        })

        res.json(response);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).send('Internal Server Error');
    }
}