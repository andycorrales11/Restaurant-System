import { Client } from 'ts-postgres';

export class Employee {
    private _id: number;            
    private _manager: boolean;     
    private _name: string;          
    private _email: string;     
    private _terminated: boolean; 
    private _kiosk: boolean;  

    constructor(id: number = 0, manager: boolean = false, name: string = "default", email: string = "default", terminated: boolean = false, kiosk: boolean = false) {
        this._id = id;
        this._manager = manager;
        this._name = name;
        this._email = email;
        this._terminated = terminated;
        this._kiosk = kiosk;
    }

    public isManager(): boolean {
        return this._manager;
    }

    public isKiosk(): boolean {
        return this._kiosk;
    }

    public getName(): string {
        return this._name;
    }

    public getId(): number {
        return this._id;
    }

    public getemail(): string {
        return this._email;
    }

    public isTerminated(): boolean {
        return this._terminated;
    }

    public async saveToDatabase(client: Client): Promise<void> {
        const query = `
            INSERT INTO employees (id, manager, name, email, terminated, kiosk)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO UPDATE
            SET manager = EXCLUDED.manager,
                name = EXCLUDED.name,
                email = EXCLUDED.email,
                terminated = EXCLUDED.terminated,
                kiosk = EXCLUDED.kiosk;
        `;
        await client.query(query, [this._id, this._manager, this._name, this._email, this._terminated, this._kiosk]);
    }

    // // Override toJSON to ensure it returns a plain object
    // toJSON() {
    //     return {
    //         uniqueid: this._id,
    //         manager: this._manager,
    //         name: this._name,
    //         email: this._email,
    //         terminated: this._terminated
    //     };
    // }


}