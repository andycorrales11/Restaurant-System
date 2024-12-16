import React, {useEffect} from "react";

import "../css/inventoryordering.css";

/**
 * InventoryAdjustments creates the inventory adjustments page and stores all 
 * of the functions to allow it to communicate with the backend
 * @returns the html code that constructs the page
 */
function InventoryAdjustments() {
    
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
        const button1 = document.getElementById('ReceiveInventoryButton');
        button1.onclick = () => {
            ReceiveInventory();
            alert('Inventory Received!');
            fetchData();
        }
        const button2 = document.getElementById('updateButton');
        button2.onclick = () => {
            const rowArray = getAdjustedRows(document.getElementById('inventoryTable').getElementsByTagName('tbody')[0]);
            sendAdjustmentsToDatabase(rowArray);
            alert('Adjustments Made!');
            fetchData();
        }
    }, []);

    /**
     * populateInventoryTable uses the data from the database to fill out the inventory
     * table, creating a new row for each item, complete with an input field
     * @param {*} data the inventory table data from the database returned by the fetch in fetchData
     */
    function populateInventoryTable(data) {
        const table = document.getElementById('inventoryTable').getElementsByTagName('tbody')[0];
        table.innerHTML = '';

        data.forEach((item, index) => {
            const newRow = table.insertRow();
            newRow.insertCell(0).innerText = item.itemCode;
            newRow.insertCell(1).innerText = item.description;
            newRow.insertCell(2).innerText = item.currentQTY;

            const inputCell = newRow.insertCell(3);
            const input = document.createElement('input');
            input.type = 'number';
            input.placeholder = '0';
            inputCell.appendChild(input);
        });
    }
    
    /**
     * ReceiveInventory is called by the receive inventory button, and gets the 
     * inventory data from the database, in order to add all of the ordered quantities
     * to the stock on hand to update the database when the order is received
     */
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
    
    /**
     * getAdjustedRows goes through the adjustment table and grabs any rows
     * where an adjustment amount is entered. It then converts that data to
     * an array and returns the array
     * @param {*} table the inventory table containing adjustment data
     * @returns the adjusted itemsand details as an array
     */
    function getAdjustedRows(table) {
        const rowsArray = [];
        for (let row of table.rows) {
            let value = row.cells[3].getElementsByTagName('input')[0].value;
            if (value !== '') {
                const number = Number(value);
                if (Number.isInteger(number) && number >= 0) {
                    const rowObject = {
                        itemCode: row.cells[0].innerText,
                        description: row.cells[1].innerText,
                        currentQTY: parseInt(row.cells[2].innerText),
                        adjustedQTY: parseInt(row.cells[3].getElementsByTagName('input')[0].value)
                    };
                    rowsArray.push(rowObject);
                }
                else {
                    alert("Please enter an integer >= 0");
                }
                row.cells[3].getElementsByTagName('input')[0].value = '';
            }
        }
        return rowsArray;
    }

    /**
     * sendAdjustmentsToDatabase sends the array of data to the backend so that
     * it can add the adjustment details to the database
     * @param {*} item an array storing the details of the order in progress table
     */
    async function sendAdjustmentsToDatabase(item) {
        try {
            const response = await fetch(process.env.REACT_APP_PROXY+'/api/inventory/adjustment', {
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
        <div className="p-4">
            <main className="card w-100 gap-3">
                <div className="d-flex flex-row align-items-start justify-content-between w-100">
                    <strong className="text-lg">Inventory Adjustments</strong>
                    <button id="ReceiveInventoryButton" className="btn btn-secondary text-md fw-medium">Receive Inventory</button>
                </div>
                <section className="w-100">
                    <div class="inventoryTableContainer">
                        <table id="inventoryTable">
                            <thead>
                                <tr>
                                    <th>Item Code</th>
                                    <th>Description</th>
                                    <th>Current QTY</th>
                                    <th>Adjusted QTY</th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                    </div>
                </section>
                <div className="d-flex flex-row-reverse w-100 pt-2">
                    <button id="updateButton" className="btn btn-secondary text-md fw-medium">Update</button>
                </div>
            </main>
        </div>
    );
};

export default InventoryAdjustments;