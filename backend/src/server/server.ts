import express from 'express';
import cors from 'cors';
import Duggbase from '../models/Duggbase';
import { checkout } from '../controllers/CheckoutController'
import { terminateEmployee, updateEmployee } from '../controllers/EmployeeEditController';
import { getItemTypes, getMenuItems } from '../controllers/MenuController';
import { authInit, authCallback, authLevel, authExit, authId } from '../controllers/AuthController';
import employeeRouter from '../routes/employeeRouter';
import reportingRouter from '../routes/reportingRouter';
import kitchenRouter from '../routes/kitchenRouter';
import inventoryRouter from '../routes/inventory';
import consumerRouter from '../routes/consumerRouter';
import menuItemRouter from '../routes/menuItemRouter';

const session = require('express-session');
const inventoryOrderingRouter = require("../test/inventorytest");
const openaiRouter = require('../routes/openai');

const app = express();
const PORT = 3001;

app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET || 'default-secret-key', 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' },
}));

app.use(cors());

app.use(express.json());

//connect router from import to app
app.use(inventoryRouter);
app.use(kitchenRouter);
app.use(reportingRouter);
app.use(consumerRouter);
app.use('/api/employees', employeeRouter);
app.use('/api/menuitems', menuItemRouter);
app.use('/api/openai', openaiRouter);


app.post('/api/checkout', checkout);
app.get('/api/menu', getMenuItems);
app.get('/api/itemtype', getItemTypes);
app.get('/api/auth/login', authInit);
app.get('/api/auth/callback', authCallback);
app.get('/api/auth/level', authLevel);
app.get('/api/auth/logout', authExit);
app.get('/api/auth/uniqueid', authId);

app.listen(PORT, () => {
    console.log('Server is running on http://localhost:3001');
});