import express = require('express');
import Duggbase from '../models/Duggbase';
import { Result, Client } from 'ts-postgres';
import { Item } from '../models/Item';
import { Item_t } from '../models/Item_t';
import { Order } from '../models/Order'
import { getUser } from '../controllers/userController'

const app = express();
const port = 3001;

app.use(express.json());

app.get('/api/employee/:ID', (req, res, next) => {
    getUser(req, res);
});
const type: Item_t = new Item_t(0, 'test', 10);
const it: Item = new Item(100000, type);
app.get('/api/item/:itemID', (req, res) => {
    it.setTypeById(req.params['itemID']).then((item_t : Item_t) =>{
        res.json([item_t])
    })
});
app.listen(port, () => {
    console.log('Server is running on http://localhost:3001');
});