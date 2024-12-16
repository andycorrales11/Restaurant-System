import React, {useEffect, useState} from "react";
import clsx from "clsx";

import "../css/inventoryordering.css";

/**
 * InventoryOrdering creates the inventory ordering page and stores all 
 * of the functions to allow it to communicate with the backend
 * @returns the html code that constructs the page
 */
function InventoryOrdering() {
    const [showDeficit, setShowDeficit] = useState(false);
    const [inventoryApi, setInventoryApi] = useState([]);

    /**
     * fetchData performs a fetch to grab the inventory table data from the database.
     * It then populates the inventory table on the page using this data
     */
    async function fetchData() {
        try {
            const response = await fetch(process.env.REACT_APP_PROXY+'/api/inventory/table');
            if (response.ok) {
                const data = await response.json();
                populateInventoryTable(data);
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

    /**
     * useEffect runs when the page is loaded, calling fetchData() to populate the
     * inventory table, as well as setting up various button onclick functions
     */
    useEffect(() => {
        fetchData();
        const button1 = document.getElementById('RestockButton');
        button1.onclick = () => {
            MakeRestockOrder(document.getElementById('inventoryTable').getElementsByTagName('tbody')[0]);
        };
        const button2 = document.getElementById('finishOrderButton');
        button2.onclick = () => {
            const rowArray = serializeTableRows(document.getElementById('orderInProgressTable').getElementsByTagName('tbody')[0]);
            sendOrderToDatabase(rowArray);
            document.getElementById('orderInProgressTable').getElementsByTagName('tbody')[0].innerHTML = '';
            document.getElementById('totalCost').innerText = 'Total: $0.00';
            alert("Order Placed!");
            fetchData();
        };
    }, []);

    /**
     * populateInventoryTable uses the data from the database to fill out the inventory
     * table, creating a new row for each item, complete with an input field and button
     * @param {*} data the inventory table data from the database returned by the fetch in fetchData
     */
    function populateInventoryTable(data) {
        const table = document.getElementById('inventoryTable').getElementsByTagName('tbody')[0];
        table.innerHTML = '';

        data.forEach((item, index) => {
            const newRow = table.insertRow();
            newRow.insertCell(0).innerHTML = `${item.itemCode} - ${item.description}`;
            newRow.insertCell(1).innerHTML = item.unitCost;
            newRow.insertCell(2).innerHTML = item.currentQTY;
            newRow.insertCell(3).innerHTML = item.currentQTY-item.neededQTY>=0 ? item.currentQTY-item.neededQTY : `<span class="text-danger">(${(item.currentQTY-item.neededQTY)*-1})</span>`;

            const inputCell = newRow.insertCell(4);
            const input = document.createElement('input');
            input.type = 'number';
            input.placeholder = '0';
            inputCell.appendChild(input);

            const actionCell = newRow.insertCell(5);
            const button = document.createElement('button');
            button.innerText= 'Add to Order';
            button.onclick = () => {
                const quantity = input.value;
                addToOrderInProgressTable(item.itemCode, item.description, item.unitCost, quantity);
                input.value = '';
            };
            button.className = 'btn btn-primary';
            actionCell.appendChild(button);
        });
    }

    /**
     * updateTotalCost loops through the order in progress table and adds
     * all of the costs of iems together, to then set the total cost label to that value
     */
    function updateTotalCost() {
        const table = document.getElementById('orderInProgressTable').getElementsByTagName('tbody')[0];
        let totalCost = 0;
        for (let row of table.rows) {
            totalCost += parseFloat(row.cells[3].innerText);
        }
        document.getElementById('totalCost').innerText = `Total: $${totalCost.toFixed(2)}`;
    }

    /**
     * addToOrderInProgressTable is called by the buttons in the inventory table to
     * add that item to the order in progress. The restock items button also calls this function
     * in a similar manner, adding the applicable items/rows to the order in progress table
     * @param {*} itemCode the item code of the item being ordered
     * @param {*} description the name of the item being ordered
     * @param {*} unitCost the unit cost of the item being ordered
     * @param {*} orderedQTY the amount of item being ordered
     * @returns function returns if ordered amount is invalid or if the item already exists
     * in the in order table so as to not create a new row
     */
    function addToOrderInProgressTable(itemCode, description, unitCost, orderedQTY) {
        if (orderedQTY == '') {
            alert("Please enter a positive integer");
            return;
        }
        let value = Number(orderedQTY);
        if (Number.isInteger(value) && value > 0) {
            const table = document.getElementById('orderInProgressTable').getElementsByTagName('tbody')[0];

            let itemExists = false;

            for (let row of table.rows) {
                const existingItemCode = row.cells[0].innerText.split(' - ')[0];
                if (existingItemCode == itemCode) {
                    const existingQuantity = parseInt(row.cells[2].innerText);
                    const newQuantity = existingQuantity + parseInt(orderedQTY);
                    row.cells[2].innerText = newQuantity;
                    var newTotal = (unitCost * newQuantity).toFixed(2);
                    row.cells[3].innerText = newTotal;
                    itemExists = true;
                    break;
                }
            }

            if (itemExists) {
                updateTotalCost();
                return;
            }

            const newRow = table.insertRow();
            newRow.insertCell(0).innerText = `${itemCode} - ${description}`;
            newRow.insertCell(1).innerText = unitCost;
            newRow.insertCell(2).innerText = orderedQTY;
            var newRowTotal = (unitCost * orderedQTY).toFixed(2);
            newRow.insertCell(3).innerText = newRowTotal;

            const actionCell = newRow.insertCell(4);
            const button = document.createElement('button');
            button.innerText = 'Remove from Order';
            button.onclick = () => {
                table.deleteRow(newRow.rowIndex - 1);
                updateTotalCost()
            };
            button.className = 'btn btn-primary';
            actionCell.appendChild(button);
            updateTotalCost();
        }
        else {
            alert("Please enter a positive integer");
            return;
        }
    }

    /**
     * MakeRestockOrder is called by the restock items button to add the items
     * that need to be ordered to the order in progress table
     * @param {*} table the inventory table with ingredient details
     */
    function MakeRestockOrder(table) { 
        for (let row of table.rows) {
            let currentQTY = parseInt(row.cells[2].innerText);
            if (row.cells[3].innerText[0] == '(') {
                let diff = parseInt(row.cells[3].innerText.replace(/[()]/g, ''));
                addToOrderInProgressTable(row.cells[0].innerText.split(' - ')[0], row.cells[0].innerText.split(' - ')[1], row.cells[1].innerText, diff);
            }
        }
    }

    /**
     * serializeTableRows takes the data from the order in progress table and 
     * converts it to an array that can be used by the backend to create new entries
     * in the database
     * @param {*} table the order in progress table with details about items being ordered
     * @returns rowsArray, which is an array containing the table's information
     */
    function serializeTableRows(table) {
        const rowsArray = [];
        for (let row of table.rows) {
            const rowObject = {
                itemCode: row.cells[0].innerText.split(' - ')[0],
                description: row.cells[0].innerText.split(' - ')[1],
                unitCost: parseFloat(row.cells[1].innerText),
                quantity: parseInt(row.cells[2].innerText),
                total: parseFloat(row.cells[3].innerText)
            };
            rowsArray.push(rowObject);
        }
        return rowsArray;
    }

    /**
     * sendOrderToDatabase sends the array of data to the backend so that
     * it can add the order details to the database
     * @param {*} item an array storing the details of the order in progress table
     */
    async function sendOrderToDatabase(item) {
        try {
            const response = await fetch(process.env.REACT_APP_PROXY+'/api/inventory/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(item),
            });
        }
        catch (error) {
            console.error('Error: ', error);
        }
    }
    
    return (
        <div className="d-flex flex-column p-4 gap-4 overflow-y-scroll">
            <main className="card w-100 gap-3">
                <div className="d-flex flex-row align-items-start justify-content-between w-100">
                    <div className="d-flex flex-row gap-2">
                        <strong className="text-lg pr-2">Inventory Ordering</strong>
                        <div role="button" className={clsx("d-flex flex-row align-items-center p-2 gap-3 rounded-2 link-no-underline transition-all text-sm fw-medium", (!showDeficit ? "nav-btn-selected" : "text-black"))} onClick={() => {
                            populateInventoryTable(inventoryApi);
                            setShowDeficit(false);
                        }}>
                            All Items
                        </div>
                        <div role="button" className={clsx("d-flex flex-row align-items-center p-2 gap-3 rounded-2 link-no-underline transition-all text-sm fw-medium", (showDeficit ? "nav-btn-selected" : "text-black"))} onClick={() => {
                            populateInventoryTable(inventoryApi.filter((e) => e.currentQTY<e.neededQTY))
                            setShowDeficit(true);
                        }}>
                            Restock
                        </div>
                    </div>
                    <button id="RestockButton" className="btn btn-secondary text-md fw-medium">Restock Items</button>
                </div>
                <section className="w-100">
                    <div class="inventoryTableContainer">
                        <table id="inventoryTable">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>USD/Serving</th>
                                    <th>Inventory</th>
                                    <th>Surplus (Deficit)</th>
                                    <th>Order QTY</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
            <main className="card w-100 gap-3">
                <div className="d-flex flex-column align-items-start w-100">
                    <strong className="text-lg">Order Cart</strong>
                </div>
                <section className="w-100">
                    <div class="inventoryTableContainer">
                        <table id="orderInProgressTable">
                            <thead>
                            <tr>
                                <th>Item</th>
                                <th>USD/Serving</th>
                                <th>Quantity</th>
                                <th>Total</th>
                                <th>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                    </div>
                    <div className="totalBar">
                        <p id="totalCost" className="text-md fw-medium">Total: $0.00</p>
                        <button id="finishOrderButton" className="btn btn-secondary text-md fw-medium">Finish Order</button>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default InventoryOrdering;