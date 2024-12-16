
import { connect } from 'ts-postgres';
import * as dotenv from 'dotenv';
dotenv.config()

/**
 * Connects to database.
 * @returns {Promise<Client>} Database client
 */
async function Duggbase() {
    
    return await connect({
        host: "csce-315-db.engr.tamu.edu",
        port: 5432,
        user: "csce331_42",
        database: "csce331_42",
        password: process.env.DB_PASSWORD
    });
}

export default Duggbase;