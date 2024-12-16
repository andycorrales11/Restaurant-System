import { Item_t } from './Item_t';
import { Menu_Item } from './Menu_Item';
import Duggbase from './Duggbase';
import { Client, Result } from 'ts-postgres'

/** Class representing order item. */
export class Item {
    private _id: number;
    private _type?: Item_t;
    private _menuItems: Menu_Item[];
    private _supply: number[];
    private _total: number;

    /**
     * Creates order item.
     * @param {number} id - Unique ID of order item
     * @param {Item_t} type - Item type of order item
     * @param {Menu_Item[]} menuItems - List of menu items in order item
     * @param {number[]} supply - Inventory item used by order item
     */
    constructor(id: number = 0, type?: Item_t, menuItems: Menu_Item[] = [], supply: number[] = []) {
        this._id = id;
        this._type = type;
        this._menuItems = menuItems;
        this._supply = supply;
        this._total = 0;
    }

    /**
     * Gets item type of order item.
     * @returns {Item_t} Item type of order item
     */
    public getType(): Item_t | undefined {
        return this._type;
    }

    /**
     * Sets item type by name.
     * @param {string} name - Name of item type
     * @returns {Item_t} Item type after change
     */
    public async setTypeByName(name: string): Promise<Item_t> {
        const client = await Duggbase()
        const result = await client.query("SELECT uniqueid, name, price FROM item_type WHERE name = $1", [name])
        const row = result.rows[0];
        const id = row.get('uniqueid') as number;
        const typeName = row.get('name') as string;
        const price = row.get('price') as number;
        
        this._type = new Item_t(id, typeName, price);
        this._total = price;
        const supplyQuery = `
            SELECT 
                ARRAY_AGG(supply.inventoryid) AS inventoryid_arr 
            FROM supply 
            JOIN item_type ON item_type.uniqueid = supply.item_typeid 
            WHERE item_type.uniqueid = $1 
            GROUP BY item_type.uniqueid
        `;
        try {
            const supplyRes = await client.query(supplyQuery, [id]);
            const supplyRow = supplyRes.rows[0];
            this._supply = supplyRow.get('inventoryid_arr') as number[] || [];
        }
        catch (e:any) {
            console.log(e);
            console.error(`Cannot find supply for item_type ${name}`);
            this._supply = [];
        }
        return this._type;

    }
    /**
     * Sets item type by unique ID of item type.
     * @param {string} uniqueid - Unique ID of item type
     * @returns {Promise<Item_t>} 
     */
    public async setTypeById(uniqueid: string): Promise<Item_t> {
        const client = await Duggbase();
        const result = await client.query("SELECT uniqueid, name, price FROM item_type WHERE uniqueid = $1", [uniqueid]);
        const id : number = +uniqueid;
        const row = result.rows[0];
        const name = row.get('name') as string;
        const typeName = row.get('name') as string;
        const price = row.get('price') as number;
        
        this._type = new Item_t(id, typeName, price);
        this._total = price;
        const supplyQuery = `
            SELECT 
                ARRAY_AGG(supply.inventoryid) AS inventoryid_arr 
            FROM supply 
            JOIN item_type ON item_type.uniqueid = supply.item_typeid 
            WHERE item_type.uniqueid = $1 
            GROUP BY item_type.uniqueid
        `;
        try {
            const supplyRes = await client.query(supplyQuery, [id]);
            const supplyRow = supplyRes.rows[0];
            this._supply = supplyRow.get('inventoryid_arr') as number[] || [];
        }
        catch (e:any) {
            console.log(e);
            console.error(`Cannot find supply for item_type ${name}`);
            this._supply = [];
        }
        return this._type;
            
    }


    /**
     * Gets unique ID of order item.
     * @returns {number} Unique ID of order item
     */
    public getId(): number {
        return this._id;
    }

    /**
     * Gets total of order item.
     * @returns {number} Total of order item
     */
    public getTotal(): number {
        return this._total;
    }

    /**
     * Gets list of menu items in order item.
     * @returns {Menu_Item[]} List of menu items in order item
     */
    public getMenuItems(): Menu_Item[] {
        return this._menuItems;
    }

    /**
     * Gets list of supply used by order.
     * @returns {number[]} List of supply used by order
     */
    public getSupply(): number[] {
        return this._supply;
    }

    /**
     * Removes menu item from order item.
     * @param {number} index - Index of menu item to be removed
     */
    public removeItem(index: number): void {
        this._menuItems.splice(index, 1);
    }

    /**
     * Adds menu item to order item.
     * @param {Menu_Item} menuItem - Menu item
     */
    public addItem(menuItem: Menu_Item): void {
        this._menuItems.push(menuItem);
    }

    /**
     * Gets price of order item.
     * @returns {number} Price of order item
     */
    public getItemPrice(): number {
        for ( let mi of this._menuItems) {
            if (mi.isPremium()){
                this._total += 1.50;
            }
        }
        return this._total;
    }
}
