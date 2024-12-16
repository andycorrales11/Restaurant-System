import React, { useEffect, useState } from "react";
import { AreaChart, AreaSeries } from "reaviz";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useSearchParams } from "react-router-dom";

import fortwo from "../resources/images/fortwo.png"

function Home() {
    const [weekSalesApi, setWeekSalesApi] = useState(null);
    const [orderHistoryApi, setOrderHistoryApi] = useState([]);
    const [inventoryApi, setInventoryApi] = useState([]);
    const [userType, setUserType] = useState('Loading...');
    const [searchParams, setSearchParams] = useSearchParams();

    async function ReceiveInventory() {
        try {
            const response = await fetch(process.env.REACT_APP_PROXY+'/api/inventory/table');
            if (response.ok) {
                const data = await response.json();
                const rowsArray = [];
                data.forEach((item, index) => {
                    if (item.orderedQTY > 0) {
                        let sum = item.currentQTY + item.orderedQTY;
                        const rowObject = {
                            itemCode: item.itemCode,
                            description: item.description,
                            currentQTY: item.currentQTY,
                            adjustedQTY: sum
                        };
                        rowsArray.push(rowObject);
                    }
                });

                try {
                    const response = await fetch(process.env.REACT_APP_PROXY+'/api/inventory/receiveInventory', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(rowsArray),
                    });
                }
                catch (error) {
                    console.error('Error: ', error);
                }
            }
            else {
                console.log("response not ok");
            }
        }
        catch (error) {
            console.error('Network error:', error);
        }
    }

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

                // Home reporting data points
                response = await fetch(process.env.REACT_APP_PROXY+'/api/reporting/datapoints');
                if (response.ok) {
                    const data = await response.json();
                    setWeekSalesApi(data);
                }
                else {
                    console.log("response not ok");
                }

                // Order history
                response = await fetch(process.env.REACT_APP_PROXY+'/api/reporting/orderhistory');
                if (response.ok) {
                    const data = await response.json();
                    setOrderHistoryApi(data);
                }
                else {
                    console.log("response not ok");
                }

                // Inventory table
                response = await fetch(process.env.REACT_APP_PROXY+'/api/inventory/table');
                if (response.ok) {
                    const data = await response.json();
                    setInventoryApi(data);
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
    }, []);

    const dayDifference = weekSalesApi ? (((weekSalesApi[weekSalesApi.length-1].sales/weekSalesApi[0].sales)-1)*100).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : 0;

    if(userType==="Manager" || userType==="Employee") {
        return (
            <div className="d-flex flex-column w-100 h-100 p-4 gap-4 overflow-y-scroll">
                {
                    userType==="Manager" ?
                    <div className="d-flex flex-row w-100 h-100 gap-4">
                        {
                            weekSalesApi ? 
                            <div className="card d-flex flex-column align-items-start w-100 h-100">
                                <span className="text-lg">7-Day Sales Total</span>
                                <h1 className="text-xl fw-medium pb-4">${weekSalesApi.map((e) => e.sales).reduce((p, a) => p+a, 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h1>
                                <div className="d-flex flex-row w-100 h-100">
                                    <small className="axis-label fw-medium subtext">Sales (USD)</small>
                                    <AreaChart
                                        data={weekSalesApi.map((data) => ({key: new Date(new Date(data.date).getTime()+new Date(data.date).getTimezoneOffset()*60000), data: data.sales}))}
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
                                weekSalesApi ? 
                                <div className="card d-flex flex-column justify-content-center align-items-start w-100 h-100">
                                    <span className="text-md fw-medium">Day Sales</span>
                                    <div className="d-flex flex-row align-items-center gap-2">
                                        <h1 className="text-xl fw-medium" translate="no">${weekSalesApi[weekSalesApi.length-1].sales.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h1>
                                    </div>
                                </div> :
                                <section className="card d-flex flex-column justify-content-center align-items-center w-100 h-100 gap-4 px-0">
                                    <div class="spinner-grow bg-panda-red" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                </section>
                            }
                            {
                                weekSalesApi ? 
                                <div className="card d-flex flex-column justify-content-center align-items-start w-100 h-100">
                                    <span className="text-md fw-medium">Day Difference</span>
                                    <div className="d-flex flex-row align-items-center gap-2">
                                        <h1 className="text-xl fw-medium text-nowrap" translate="no">{`${dayDifference>=0 ? "+" : ""}${dayDifference}`}%</h1>
                                        {dayDifference>=0 ? <TrendingUpIcon sx={{ fontSize: 32, color: "#34C759" }} /> : <TrendingDownIcon sx={{ fontSize: 32, color: "#FF3B30" }} />}
                                    </div>
                                    <span className="subtext">Compared to {new Date(new Date(weekSalesApi[0].date).getTime()+new Date(weekSalesApi[0].date).getTimezoneOffset()*60000).toLocaleDateString()}</span>
                                </div> :
                                <section className="card d-flex flex-column justify-content-center align-items-center w-100 h-100 gap-4 px-0">
                                    <div class="spinner-grow bg-panda-red" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                </section>
                            }
                        </div>
                    </div> :
                    []
                }
                <div className="d-flex flex-row w-100 h-100 min-h-card gap-4">
                    <div className="card w-100 gap-3">
                        <div className="d-flex flex-column align-items-start w-100">
                            <strong className="text-lg">Order History</strong>
                        </div>
                        <section className="w-100 h-100 overflow-y-hidden">
                            <div class="h-100 overflow-y-scroll">
                                <table id="orderInProgressTable">
                                    <thead>
                                    <tr>
                                        <th>Order Number</th>
                                        <th>Employee</th>
                                        <th>Date</th>
                                        <th>Total</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                        {orderHistoryApi.map((e) => 
                                            <tr>
                                                <td>{e.uniqueid}</td>
                                                <td>{e.name}</td>
                                                <td>{new Date(Date.parse(e.dateOfSale)+new Date(weekSalesApi[0].date).getTimezoneOffset()*60000).toLocaleString()}</td>
                                                <td>${e.total.toFixed(2)}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                    {
                        userType==="Manager" ?
                        <div className="card d-flex flex-column justify-content-between w-100 gap-3">
                            <section className="d-flex flex-column w-100 gap-3">
                                <div className="d-flex flex-row align-items-start justify-content-between w-100">
                                    <strong className="text-lg">Order in Progress</strong>
                                    <button className="btn btn-secondary text-md fw-medium" onClick={() => {
                                        ReceiveInventory();
                                        alert('Inventory Received!');
                                        window.location.reload();
                                    }}>Receive Inventory</button>
                                </div>
                                <div class="inventoryTableContainer">
                                    <table id="orderInProgressTable">
                                        <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Quantity</th>
                                            <th>Total</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                            {inventoryApi.map((e) => 
                                                e.orderedQTY!==0 ?
                                                <tr>
                                                    <td>{`${e.itemCode} - ${e.description}`}</td>
                                                    <td>{e.orderedQTY}</td>
                                                    <td>${(e.orderedQTY*e.unitCost).toFixed(2)}</td>
                                                </tr> :
                                                []
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                            <p id="totalCost" className="text-md fw-medium">Total: $0.00</p>
                        </div> :
                        []
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

export default Home;
