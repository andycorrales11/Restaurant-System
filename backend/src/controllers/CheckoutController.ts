import { Request, Response } from 'express'
import { Item } from '../models/Item';
import { Menu_Item } from '../models/Menu_Item';
import { Order } from '../models/Order';
import Duggbase from '../models/Duggbase';
const url = require('url');

/**
 * Processes checkout orders. Decreases inventory accordingly.
 * @param {Request} req - HTTP request with employee unique ID, list of order items of format [item_t, side, entree1, entree2, entree3], and amount as body
 * @param {Response} res - HTTP response with order and list of order items of format [orderId, ...itemIds]
 */
export const checkout = async ( req : Request, res : Response) => {
    let q = url.parse(req.url, true).query;
    const { employee, dbcodes, amount } = req.body;
    var order = new Order(undefined, undefined, undefined, employee);
    for (let i = 0; i < amount; i++) {
        var item = new Item();
        item.setTypeById(dbcodes[i][0]);
        var caller = new Menu_Item();
        for (let j = 1; j < 5; j++) {
            const mi = await caller.fromProductCode(dbcodes[i][j]);
            item.addItem(mi);
        }
        order.addItem(item);
    }


    const rn = new Date();
    order.calculateTotalPrice();
    const query = `
    INSERT INTO order_history(order_total, date_of_sale, employee, finished) 
    VALUES ($1, $2, $3, $4) 
    RETURNING uniqueid
    `;
    const query2 = `
    INSERT INTO items(item_t, side, entree1, entree2, entree3)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING uniqueid
    `;
    const query3 = `
    INSERT INTO item_in_order(itemid, order_historyid)
    VALUES ($1, $2)
    RETURNING uniqueid
    `;
    const query4 = `
    SELECT
        ingredient.inventoryid
    FROM ingredient
    JOIN menu_items ON menu_items.uniqueid = ingredient.menu_itemid
    WHERE menu_items.uniqueid=$1
    GROUP BY ingredient.uniqueid
    `;
    const query5 = `
    "UPDATE inventory SET amount_on_hand=amount_on_hand-1 WHERE uniqueid=$1"
    `;
    const query6 = `
    SELECT 
        supply.inventoryid
    FROM supply
    JOIN item_type ON item_type.uniqueid = supply.item_typeid
    WHERE item_type.uniqueid=$1
    GROUP BY supply.inventoryid
    `;
    const query7 = `
    UPDATE inventory SET amount_on_hand=amount_on_hand-1 WHERE uniqueid=$1
    `;
    const client = await Duggbase();
    let finished = true;
    if (parseInt(employee) === 9) {
        finished = false;
    }
    const res2 = await client.query(query, [order.getTotal(), rn, employee, finished]);
    const orderid = res2.rows[0].at(0);
    let itemids = [];
    for (let i = 0; i < order.itemCount(); i++) {
        const item = order.getItems()[i]
        const itemtype = item.getType();
        const menuItems = item.getMenuItems();
        const res3 = await client.query(query2, [itemtype?.getId(), ...menuItems.map((e) => e.getId())])
        const itemid = res3.rows[0].at(0);
        console.log('added item id: %d to database', itemid)
        itemids[i]= await client.query(query3, [itemid, orderid]);

        // Ingredient processing
        menuItems.forEach(async (e) => {
            const res4 = await client.query(query4, [e]);
            res4.rows.forEach((inventoryid) => client.query(query5, [inventoryid]));
        });

        // Supply processing
        const res6 = await client.query(query6, [itemtype]);
        res6.rows.forEach((inventoryid) => client.query(query7, [inventoryid]));
    }
    res.json([orderid, ...itemids]);
    console.log("added order id: %d to database", orderid);

    // Rewards processing
    if(q.email) {
        let rewardsExpiration = new Date(Date.now());
        rewardsExpiration.setDate(rewardsExpiration.getDate()+365);
        client.query(`INSERT INTO rewards (email, points, expiration) VALUES ('${q.email}', ${Math.floor(order.getTotal()*10)}, '${rewardsExpiration.toISOString()}'::TIMESTAMP)`);
        console.log("added rewards: %s to database points %d expiring %s", q.email, Math.floor(order.getTotal()*10), rewardsExpiration.toISOString());
    }

    client.end();
}

