import { Client, Result } from 'ts-postgres';
import { InventoryItem } from './InventoryItem';
import Duggbase from './Duggbase';

/** Class representing menu item. */
export class Menu_Item {
    private _id: number;
    private _productCode: string;
    private _name: string;
    private _premium: boolean;
    private _side: boolean;
    private _appetizer: boolean;
    private _drink: boolean;
    private _ingredients: InventoryItem[];
    private _ingredientsId: number[];

    /**
     * Creates menu item
     * @param {number} id - Unique ID of menu item
     * @param {string} productCode - Product code letter-number pair of menu item
     * @param {string} name - Name of menu item
     * @param {boolean} premium - Menu item is premium
     * @param {InventoryItem[]} ingredients - Inventory items used by menu item
     */
    constructor(id: number = 0, productCode: string = "Z0", name: string = "default", premium: boolean = false, side: boolean = false, drink : boolean = false, appetizer : boolean = false, ingredients: InventoryItem[] = []) {
        this._id = id;
        this._productCode = productCode;
        this._name = name;
        this._premium = premium;
        this._ingredients = ingredients || [];
        this._ingredientsId = [];
        this._side = side;
        this._drink = drink;
        this._appetizer = appetizer;
    }

    /**
     * Gets menu item from product code.
     * @param {string} productCode - Product code letter-number pair
     * @returns {Promise<Menu_Item>} Menu item
     */
    public async fromProductCode(productCode: string): Promise<Menu_Item> {
        const client = await Duggbase();
        const result = await client.query('SELECT * FROM menu_items WHERE uniqueid = $1 AND NOT removed;', [productCode]);
        const l = result.rows.length;
        if ( l === 0) return new Menu_Item(0);
        const row = result.rows[0];
        const id = row.get('uniqueid') as number;
        const name = row.get('name') as string;
        const premium = row.get('premium') as boolean;
        const side = row.get('side') as boolean;
        const appetizer = row.get('appetizer') as boolean;

        var menuItem = new Menu_Item(id, productCode, name, premium);
        menuItem._side = side;
        menuItem._appetizer = appetizer;
        const ingredientsQuery = `
        SELECT 
            ARRAY_AGG(ingredient.inventoryid) AS inventoryid_arr 
        FROM ingredient 
        JOIN menu_items ON menu_items.uniqueid = ingredient.menu_itemid 
        WHERE menu_items.uniqueid = $1 
        GROUP BY menu_items.uniqueid;
        `;
        const res = await client.query(ingredientsQuery, [id]);
        const ingredientsRow = res.rows[0];
        const inventoryIds = ingredientsRow.get('inventoryid_arr') as number[] | null;
        menuItem._ingredientsId = inventoryIds ? inventoryIds : [];
        return menuItem;
    }

    // getters

    /**
     * Gets unique ID of menu item.
     * @returns {number} Unique ID of menu item
     */
    public getId(): number {
        return this._id;
    }

    /**
     * Gets product code of menu item.
     * @returns {string} Product code letter-number pair menu item
     */
    public getProductCode(): string {
        return this._productCode;
    }

    /**
     * Gets name of menu item.
     * @returns {string} Name of menu item
     */
    public getName(): string {
        return this._name;
    }

    /**
     * Checks whether menu item is a premium item.
     * @returns {boolean} Menu item is premium
     */
    public isPremium(): boolean {
        if (!this._premium) {
            return false;
        }
        return this._premium;
    }

    /**
     * Checks whether menu item is a side.
     * @returns {boolean} Menu item is a side
     */
    public isSide(): boolean {
        return this._side;
    }

    /**
     * Checks whether menu item is a drink.
     * @returns {boolean} Menu item is a drink
     */
    public isDrink(): boolean {
        return this._drink;
    }

    /**
     * Checks whether menu item is an appetizer.
     * @returns {boolean} Menu item is an appetizer
     */
    public isAppetizer(): boolean {
        return this._appetizer;
    }

    /**
     * Gets list of inventory items used by menu item.
     * @returns {InventoryItem[]} List of inventory items used by menu item
     */
    public getIngredients(): InventoryItem[] {
        return this._ingredients;
    }

    /**
     * Gets list of unique ID of inventory items used by menu item.
     * @returns {number[]} List of unique ID of inventory items used by menu item
     */
    public getIngredientsId(): number[] {
        return this._ingredientsId;
    }
}
