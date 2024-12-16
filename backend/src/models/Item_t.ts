/** Class representing item type. */
export class Item_t {
    private _id: number;
    private _name: string;
    private _price: number;

    /**
     * Creates item type.
     * @param {number} id - Unique ID of item type
     * @param {string} name - Name of item type
     * @param {number} price - Base price of item type
     */
    constructor(id: number = 0, name: string, price: number) {
        this._id = id;
        this._name = name;
        this._price = price;
    }

    /**
     * Gets unique ID of item type.
     * @returns {number} Unique ID of item type
     */
    public getId(): number {
        return this._id;
    }

    /**
     * Gets name of item type.
     * @returns {string} Name of item type
     */
    public getName(): string {
        return this._name;
    }

    /**
     * Gets base price of item type.
     * @returns {number} Base price of item type
     */
    public getPrice(): number {
        return this._price;
    }


    /**
     * Sets unique ID of item type.
     * @param {number} id - Unique ID of item type
     */
    public setId(id: number): void {
        this._id = id;
    }

    /**
     * Sets name of item type.
     * @param {string} name - Name of item type
     */
    public setName(name: string): void {
        this._name = name;
    }

    /**
     * Sets base price of item type.
     * @param {number} price - Base price of item type
     */
    public setPrice(price: number): void {
        this._price = price;
    }
}