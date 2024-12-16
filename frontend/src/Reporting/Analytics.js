import React, { useEffect, useState } from "react";
import { AreaChart, AreaSeries } from "reaviz";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useSearchParams } from "react-router-dom";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { FormControl, InputLabel, MenuItem, OutlinedInput, Select } from "@mui/material";

import fortwo from "../resources/images/fortwo.png"

function Analytics() {
    const [salesApi, setSalesApi] = useState(null);
    const [invQuantityApi, setInvQuantityApi] = useState(null);
    const [userType, setUserType] = useState('Loading...');
    const [searchParams, setSearchParams] = useSearchParams();

    let weekBefore = new Date(Date.now());
    weekBefore.setDate(weekBefore.getDate()-7);
    const [startDate, setStartDate] = useState(dayjs(weekBefore));
    const [endDate, setEndDate] = useState(dayjs(Date.now()));

    const [inventoryList, setInventoryList] = useState([]);
    const [selectedInventory, setSelectedInventory] = useState(51);
    const [invStartDate, setInvStartDate] = useState(dayjs(weekBefore));
    const [invEndDate, setInvEndDate] = useState(dayjs(Date.now()));

    useEffect(() => {
        async function fetchData() {
            try {
                // Userinfo from Google
                let accessToken;
                if(searchParams.has('access_token')) {
                    accessToken = searchParams.get('access_token');
                    document.cookie = 'access_token='+accessToken+'; secure'
                }
                else {
                    accessToken = document.cookie.split("; ").filter((e) => e.includes("access_token"))[0].split('=')[1];
                }

                // Authorization level from DB
                let response = await fetch(process.env.REACT_APP_PROXY+`/api/auth/level?access_token=${accessToken}`);
                if (response.ok) {
                    const data = await response.json();
                    setUserType(data);
                }
                else {
                    console.log("response not ok");
                }
            }
            catch (error) {
                console.error('Network error:', error);
            }
        }
        async function fetchInventory() {
            try {
                const response = await fetch(process.env.REACT_APP_PROXY+'/api/inventory/table');
                if (response.ok) {
                    const data = await response.json();
                    setInventoryList(data.map((e) => [e.description, e.itemCode]));
                }
                else {
                    console.log("response not ok");
                }
            }
            catch (error) {
                console.error('Network error:', error);
            }
        }
        fetchData();
        fetchInventory();
    }, []);

    useEffect(() => {
        async function fetchData() {
            try {
                // Sales reporting data points
                const response = await fetch(process.env.REACT_APP_PROXY+`/api/reporting/datapoints?start=${startDate}&end=${endDate}`);
                if (response.ok) {
                    const data = await response.json();
                    setSalesApi(data);
                }
                else {
                    console.log("response not ok");
                }
            }
            catch (error) {
                console.error('Network error:', error);
            }
        }
        if(startDate<=endDate) {
            fetchData();
        }
    }, [startDate, endDate]);

    useEffect(() => {
        async function fetchData() {
            console.log("test");
            try {
                // Sales reporting data points
                const response = await fetch(process.env.REACT_APP_PROXY+`/api/reporting/inventorydatapoints?start=${invStartDate}&end=${invEndDate}&inventoryid=${selectedInventory}`);
                if (response.ok) {
                    const data = await response.json();
                    setInvQuantityApi(data);
                }
                else {
                    console.log("response not ok");
                }
            }
            catch (error) {
                console.error('Network error:', error);
            }
        }
        if(invStartDate<=invEndDate&&selectedInventory) {
            fetchData();
        }
    }, [invStartDate, invEndDate, selectedInventory]);

    const dayDifference = salesApi ? (((salesApi[salesApi.length-1].sales/salesApi[0].sales)-1)*100).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : 0;

    if(userType==="Manager" || userType==="Employee") {
        return (
            <div className="d-flex flex-column w-100 h-100 p-4 gap-4 overflow-y-scroll">
                <div className="d-flex flex-row w-100 h-100 min-h-card gap-4">
                    {
                        salesApi ? 
                        <div className="card d-flex flex-column align-items-start w-100 h-100">
                            <div className="d-flex flex-row justify-content-between align-items-end w-100">
                                <div>
                                    <span className="text-lg">Total</span>
                                    <h1 className="text-xl fw-medium pb-4">${salesApi.map((e) => e.sales).reduce((p, a) => p+a, 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h1>
                                </div>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <div className="d-flex flex-row gap-4 p-4">
                                        <DatePicker
                                            label="Start Date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e)}
                                        />
                                        <DatePicker
                                            label="End Date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e)}
                                        />
                                    </div>
                                </LocalizationProvider>
                            </div>
                            <div className="d-flex flex-row w-100 h-100">
                                <small className="axis-label fw-medium subtext">Sales (USD)</small>
                                <AreaChart
                                    data={salesApi.map((data) => ({key: new Date(new Date(data.date).getTime()+new Date(data.date).getTimezoneOffset()*60000), data: data.sales}))}
                                    series={<AreaSeries interpolation="smooth" />}
                                />
                            </div>
                        </div> :
                        <section className="card d-flex flex-column justify-content-center align-items-center w-100 h-100 gap-4 px-0">
                            <div class="spinner-grow bg-panda-red" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </section>
                    }
                    <div className="d-flex flex-column h-100 gap-4">
                        {
                            salesApi ? 
                            <div className="card d-flex flex-column justify-content-center align-items-start w-100 h-100">
                                <span className="text-md fw-medium">Today's Sales</span>
                                <div className="d-flex flex-row align-items-center gap-2">
                                    <h1 className="text-xl fw-medium" translate="no">${salesApi[salesApi.length-1].sales.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h1>
                                </div>
                            </div> :
                            <section className="card d-flex flex-column justify-content-center align-items-center w-100 h-100 gap-4 px-0">
                                <div class="spinner-grow bg-panda-red" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </section>
                        }
                        {
                            salesApi ? 
                            <div className="card d-flex flex-column justify-content-center align-items-start w-100 h-100">
                                <span className="text-md fw-medium">Day Difference</span>
                                <div className="d-flex flex-row align-items-center gap-2">
                                    <h1 className="text-xl fw-medium text-nowrap" translate="no">{`${dayDifference>=0 ? "+" : ""}${dayDifference}`}%</h1>
                                    {dayDifference>=0 ? <TrendingUpIcon sx={{ fontSize: 32, color: "#34C759" }} /> : <TrendingDownIcon sx={{ fontSize: 32, color: "#FF3B30" }} />}
                                </div>
                                <span className="subtext">Compared to {new Date(new Date(salesApi[0].date).getTime()+new Date(salesApi[0].date).getTimezoneOffset()*60000).toLocaleDateString()}</span>
                            </div> :
                            <section className="card d-flex flex-column justify-content-center align-items-center w-100 h-100 gap-4 px-0">
                                <div class="spinner-grow bg-panda-red" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </section>
                        }
                    </div>
                </div>
                
                <div className="d-flex flex-row w-100 h-100 min-h-card gap-4">
                    {
                        invQuantityApi ? 
                        <div className="card d-flex flex-column align-items-start w-100 h-100">
                            <div className="d-flex flex-column justify-content-between align-items-start w-100">
                                <strong className="text-lg">Inventory Usage</strong>
                                <div className="d-flex flex-row justify-content-between w-100 pt-2 pb-4 gap-4">
                                    <FormControl fullWidth>
                                        <InputLabel>Inventory Item</InputLabel>
                                        <Select
                                            input={<OutlinedInput label="Inventory Item" />}
                                            value={selectedInventory}
                                            label="Age"
                                            onChange={(e) => setSelectedInventory(e.target.value)}
                                        >
                                            {inventoryList.map((e) => <MenuItem value={e[1]}>{e[0]}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <div className="d-flex flex-row gap-4">
                                            <DatePicker
                                                label="Start Date"
                                                value={invStartDate}
                                                onChange={(e) => setInvStartDate(e)}
                                            />
                                            <DatePicker
                                                label="End Date"
                                                value={invEndDate}
                                                onChange={(e) => setInvEndDate(e)}
                                            />
                                        </div>
                                    </LocalizationProvider>
                                </div>
                            </div>
                            <div className="d-flex flex-row w-100 h-100">
                                <small className="axis-label fw-medium subtext">Quantity</small>
                                <AreaChart
                                    data={invQuantityApi.map((data) => ({key: new Date(new Date(data.date).getTime()+new Date(data.date).getTimezoneOffset()*60000), data: data.quantity}))}
                                    series={<AreaSeries interpolation="smooth" colorScheme={'#10b981'} />}
                                />
                            </div>
                        </div> :
                        <section className="card d-flex flex-column justify-content-center align-items-center w-100 h-100 gap-4 px-0">
                            <div class="spinner-grow bg-panda-red" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </section>
                    }
                </div>
            </div>
        );
    }
    else {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center w-100 h-100 p-4 gap-4 overflow-y-scroll">
                {
                    userType==='Kiosk' ?
                    <div className="d-flex flex-row w-100 h-100 min-h-card gap-4">
                        <div className="card w-100 gap-3 p-0">
                            <img alt="Smart Fortwo Cabrio Electric Drive" src={fortwo} className="w-100 h-100 object-fit-contain" />
                        </div>
                    </div> :
                    <div class="bg-panda-red spinner-grow" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                }
            </div>
        );
    }
}

export default Analytics;