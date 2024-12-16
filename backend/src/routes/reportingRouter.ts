import express = require('express');
import { Request, Response } from 'express';
import { getHourlyData, getOrderHistory, getReportingData } from "../controllers/ReportingController";
import { getInventoryDataPoints, getSalesDataPoints } from '../controllers/AnalyticsController';

const router = express.Router();

// Reporting
router.get('/api/reporting/xreport', getReportingData);
router.get('/api/reporting/hourlydata', getHourlyData);
router.get('/api/reporting/orderhistory', getOrderHistory);

// Analytics
router.get('/api/reporting/datapoints', getSalesDataPoints);
router.get('/api/reporting/inventorydatapoints', getInventoryDataPoints);

export default router;