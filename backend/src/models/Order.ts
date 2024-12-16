import { Employee } from './Employee';
import Duggbase from './Duggbase';
import { Item } from './Item';  
import { Client} from 'ts-postgres';
/** Class representing an order */
export class Order {
    private _id: number;
    private _total: number;
    private _time: Date;
    private _employee: Employee;
    private _items: Item[];

    /**
     * Creates order.
     * @param {Item[]} items - List of order items in order
     * @param {number} id - Unique ID of order
     * @param {number} total - Total of order
     * @param {Employee} employee - Employee responsible for order
     */
    constructor(items: Item[] = [], id: number = 0, total: number = 0, employee: Employee) {
        this._id = id;
        this._total = total;
        this._time = new Date();
        this._employee = employee || new Employee(2, false, "test", "test", false);
        this._items = items || [];
    }

    // getters
    /**
     * Gets unique ID of order.
     * @returns {number} Unique ID of order
     */
    public getId(): number {
        return this._id;
    }

    /**
     * Gets total of order.
     * @returns {number} Total of order
     */
    public getTotal(): number {
        return this._total;
    }

    /**
     * Gets time the order was issued.
     * @returns {Date} Order issue time
     */
    public getTime(): Date {
        return this._time;
    }

    /**
     * Gets employee responsible for order.
     * @returns {Employee} Employee responsible for order
     */
    public getEmployee(): Employee {
        return this._employee;
    }

    /**
     * Gets order items in order.
     * @returns {Item[]} Order items in order
     */
    public getItems(): Item[] {
        return this._items;
    }

    /**
     * Removes order item from list of order items.
     * @param {number} index - Index of item to be removed
     */
    public removeItem(index: number): void {
        this._items.splice(index, 1);
    }

    /**
     * Adds order item to order.
     * @param {Item} item - Item to be added
     */
    public addItem(item: Item): void {
        if (!this._items) {
            this._items = [];
        }
        this._items.push(item);
    }

    /**
     * Gets number of order items in order.
     * @returns {number} Number of order items in order
     */
    public itemCount(): number {
        return this._items.length;
    }

    /**
     * Gets total of order.
     * @returns {number} Total of order
     */
    public calculateTotalPrice(): number {
        this.getItems().forEach(element => {
            this._total += element.getItemPrice();
        });
        return this._total;
    }

    // check these

    /**
     * Gets order issue time as ISO string.
     * @returns {string} Order issue time as ISO string
     */
    public getDateAsString(): string {
        return this._time.toISOString().slice(0, 19).replace('T', ' ');
    }
}
