import { Request, Response } from 'express'
import Duggbase from '../models/Duggbase';
const { google } = require('googleapis');
const { randomBytes } = require('node:crypto');
const url = require('url');
const https = require('https');
require("dotenv").config({ path: "./.env" });

declare module 'express-session' {
    interface SessionData {
        state: string
    }
}

const oauth2Client = new google.auth.OAuth2(process.env.OAUTH_CLIENT_ID, process.env.OAUTH_CLIENT_SECRET, process.env.OAUTH_REDIRECT_URL);

/**
 * Gets authentication URL from Google.
 * @param {Request} req - HTTP request
 * @param {Response} res - HTTP response with authorization URL
 */
export const authInit = async (req:Request, res:Response) => {
    try {
        let state;
        randomBytes(32, (err:Error, buf:Buffer) => {
            if(err) throw err;
            state = buf.toString('hex');
        });
        req.session.state = state;

        const authorizationUrl = oauth2Client.generateAuthUrl({
            scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
            state: state
        });
        res.json(authorizationUrl);
    }
    catch (error) {
        console.error("Cannot generate authorization URL");
        res.status(500).send('Internal Server Error');
    }
}

/**
 * Callback called by Google OAuth 2.0 to exchange authentication code with access token. Redirects to home with access token.
 * @param {Request} req - HTTP request with authentication code as query
 * @param {Response} res - HTTP response used to redirect to home with access token
 */
export const authCallback = async (req:Request, res:Response) => {
    try {
        let q = url.parse(req.url, true).query;
        if(q.error) {
            throw new Error(q.error);
        }
        else if (q.state !== req.session.state) {
            throw new Error('State mismatch. Possible CSRF attack');
        }
        let { tokens } = await oauth2Client.getToken(q.code);
        oauth2Client.setCredentials(tokens);

        // Obtaining userinfo from Google
        let data;
        try {
            let response = await fetch('https://accounts.google.com/.well-known/openid-configuration');
            if (response.ok) {
                data = await response.json();
                response = await fetch(`${data.userinfo_endpoint}?access_token=${tokens.access_token}`);
                if (response.ok) {
                    data = await response.json();
                }
                else {
                    console.log("userinfo response not ok");
                }
            }
            else {
                console.log("response not ok");
            }
        }
        catch (error) {
            throw new Error('Network error:'+error);
        }

        // Revokes if email doesn't exist or is terminated
        const db = await Duggbase();
        const result = await db.query(`SELECT terminated FROM employees WHERE email='${data.email}'`);

        if(result.rows.length===0||result.rows[0][0]) {
            req.session.destroy((error:Error) => {
                if(error) {
                    console.error("LOGOUT ERROR: "+error);
                    res.status(500).send('Internal Server Error');
                }
                else {
                    let postData = "token=" + tokens.access_token;
                    let postOptions = {
                        host: 'oauth2.googleapis.com',
                        port: '443',
                        path: '/revoke',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Content-Length': Buffer.byteLength(postData)
                        }
                    };
                    const postReq = https.request(postOptions, function (res:any) {
                        res.setEncoding('utf8');
                        res.on('data', (d:any) => {
                            console.log('Response: ' + d);
                        });
                    });
                    postReq.on('error', (error:Error) => {
                        console.log(error)
                    });
                    postReq.write(postData);
                    postReq.end();
                }
            });
        }

        db.end();
        res.redirect(process.env.FRONTEND_URL+`/home?access_token=${tokens.access_token}`);
    }
    catch (error)
    {
        console.error("LOGIN ERROR: "+error);
        res.status(500).send('Internal Server Error');
    }
}

/**
 * Obtains authorization level of current user. Accesses DB by matching email returned from Google.
 * @param {Request} req - HTTP request with access token as query
 * @param {Response} res - HTTP response with authorization level (manager, employee, kiosk)
 */
export const authLevel = async (req:Request, res:Response) => {
    try {
        let q = url.parse(req.url, true).query;

        // Obtaining userinfo from Google
        let data;
        try {
            let response = await fetch('https://accounts.google.com/.well-known/openid-configuration');
            if (response.ok) {
                data = await response.json();
                response = await fetch(`${data.userinfo_endpoint}?access_token=${q.access_token}`);
                if (response.ok) {
                    data = await response.json();
                }
                else {
                    console.log("userinfo response not ok");
                }
            }
            else {
                console.log("response not ok");
            }
        }
        catch (error) {
            throw new Error('Network error:'+error);
        }

        // Getting privilege credentials
        const db = await Duggbase();
        const result = await db.query(`SELECT kiosk, manager FROM employees WHERE email='${data.email}'`);

        // If kiosk
        if(result.rows[0][0]) {
            res.json("Kiosk");
        }
        // If manager
        else if(result.rows[0][1]) {
            res.json("Manager");
        }
        else {
            res.json("Employee");
        }
        db.end();
    }
    catch (error)
    {
        console.error("AUTHORIZATION ERROR: "+error);
        res.status(500).send('Internal Server Error');
    }
}

/**
 * Obtains employee ID of current user. Accesses DB by matching email returned from Google.
 * @param {Request} req - HTTP request with access token as query
 * @param {Response} res - HTTP response with employee unique ID
 */
export const authId = async (req:Request, res:Response) => {
    try {
        let q = url.parse(req.url, true).query;

        // Obtaining userinfo from Google
        let data;
        try {
            let response = await fetch('https://accounts.google.com/.well-known/openid-configuration');
            if (response.ok) {
                data = await response.json();
                response = await fetch(`${data.userinfo_endpoint}?access_token=${q.access_token}`);
                if (response.ok) {
                    data = await response.json();
                }
                else {
                    console.log("userinfo response not ok");
                }
            }
            else {
                console.log("response not ok");
            }
        }
        catch (error) {
            throw new Error('Network error:'+error);
        }

        // Getting privilege credentials
        const db = await Duggbase();
        const result = await db.query(`SELECT uniqueid FROM employees WHERE email='${data.email}'`);
        res.json(result.rows[0][0]);

        db.end();
    }
    catch (error)
    {
        console.error("AUTHORIZATION ERROR: "+error);
        res.status(500).send('Internal Server Error');
    }
}

/**
 * Logout function for Google OAuth 2.0. Revokes access token.
 * @param {Request} req - HTTP request with access token as query
 * @param {Response} res - HTTP response returning data from Google OAuth 2.0 revoke post request
 */
export const authExit = async (req:Request, res:Response) => {
    req.session.destroy((error:Error) => {
        if(error) {
            console.error("LOGOUT ERROR: "+error);
            res.status(500).send('Internal Server Error');
        }
        else {
            let q = url.parse(req.url, true).query;
            let postData = "token=" + q.access_token;
            let postOptions = {
                host: 'oauth2.googleapis.com',
                port: '443',
                path: '/revoke',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };
            const postReq = https.request(postOptions, function (res:any) {
                res.setEncoding('utf8');
                res.on('data', (d:any) => {
                    console.log('Response: ' + d);
                });
            });
            postReq.on('error', (error:Error) => {
                console.log(error)
            });
            postReq.write(postData);
            postReq.end();
        }
    });
}