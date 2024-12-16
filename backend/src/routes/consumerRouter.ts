import express = require('express');
import { Request, Response } from 'express';
import Duggbase from '../models/Duggbase';
require("dotenv").config({ path: "./.env" });
const url = require('url');

const router = express.Router();

router.get('/api/weather', async (req:Request, res:Response) => {
    let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=College%20Station&units=imperial&appid=${process.env.OPENWEATHERMAP_API_KEY}`);
    if (response.ok) {
        const data = await response.json();
        res.json({
            tempf: Math.round(data.main.temp),
            tempc: Math.round((data.main.temp-32)*5/9),
            description: data.weather[0].description,
            icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
        });
    }
    else {
        console.log("response not ok");
    }
});

router.get('/api/rewards', async (req:Request, res:Response) => {
    try {
        let q = url.parse(req.url, true).query;
        if(q.email) {
            const db = await Duggbase();
            const result = await db.query(`SELECT points FROM rewards WHERE email='${q.email}' AND expiration>'${new Date(Date.now()).toISOString()}'::TIMESTAMP`);
            if(result.rows.length===0) {
                res.json({email: q.email, points: 0})
            }
            else {
                let points = 0;
                result.rows.forEach((e) => {
                    points+=e[0];
                });
                res.json({email: q.email, points: points});
            }
        }
        else {
            throw new Error("No email")
        }
    }
    catch (error) {
        console.error("Cannot process rewards email: "+error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;