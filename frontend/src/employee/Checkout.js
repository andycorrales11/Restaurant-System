import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import clsx from "clsx";
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import "../css/checkout.css";

import itemType from "../fixed_data/item_type.json";

function Checkout() {
    const [currentCart, setCurrentCart] = useState([]);
    const [currentSelection, setCurrentSelection] = useState({"itemType": "", "letter": "", "number": "", "other": "", "size": ""});
    const [editIndex, setEditIndex] = useState(0);
    const [menuItemApi, setMenuItemApi] = useState(null);
    const [itemTypeApi, setItemTypeApi] = useState(null);
    const [currentUser, setCurrentUser] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        async function fetchData() {
            try {
                let response = await fetch(process.env.REACT_APP_PROXY+'/api/menu');
                if (response.ok) {
                    const data = await response.json();
                    setMenuItemApi(data);
                }
                else {
                    console.log("menu item response not ok");
                }
                response = await fetch(process.env.REACT_APP_PROXY+'/api/itemtype');
                if (response.ok) {
                    const data = await response.json();
                    setItemTypeApi(data);
                }
                else {
                    console.log("item type response not ok");
                }
            }
            catch (error) {
                console.error('Network error:', error);
            }
        }
        fetchData();
    }, []);

    
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
                let response = await fetch(process.env.REACT_APP_PROXY+`/api/auth/uniqueid?access_token=${accessToken}`);
                if (response.ok) {
                    const data = await response.json();
                    setCurrentUser(data);
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

    if(menuItemApi) {
        // Context data
        let availableNumList = {"R": [], "M": [], "B": [], "C": [], "CB": [], "F": [], "V": [], "E": []};
        let availableLetterList = {"1": [], "2": [], "3": [], "4": [], "5": [], "6": [], "7": [], "8": [], "9": []};
        const buttonDictionary = {
            "SPRR": "Vegetable Spring Roll",
            "CCRG": "Cream Cheese Rangoon",
            "EGGR": "Chicken Egg Roll",
            "AAPL": "Apple Pie Roll",
            "DRNK": "Soft Drink",
            "WATR": "Aquafina",
            "GTRD": "Gatorade"
        }

        for(const [key, val] of Object.entries(menuItemApi)) {
            val.forEach((item) => {
                if(Object.hasOwn(item, "menu_code") && Object.hasOwn(availableNumList, item["menu_code"].substring(0, item["menu_code"].length-1)) && Object.hasOwn(availableLetterList, item["menu_code"].substring(item["menu_code"].length-1))) {
                    availableNumList[item["menu_code"].substring(0, item["menu_code"].length-1)].push(item["menu_code"].substring(item["menu_code"].length-1));
                    availableLetterList[item["menu_code"].substring(item["menu_code"].length-1)].push(item["menu_code"].substring(0, item["menu_code"].length-1));
                }
            });
        }

        // College Station sales tax rate
        const SALES_TAX = 0.0825;

        let price = 0;
        let itemList = [];
        let amount = 0;

        currentCart.forEach((item, index) => {
            amount++;
            let itemPrice = item["price"];
            if(["Bowl", "Plate", "Bigger Plate"].indexOf(item["name"])>=0) {
                item["items"].forEach((e) => {
                    if(e["premium"]) itemPrice+=1.50;
                })
                itemList.push(
                    <div className={clsx("d-flex flex-row w-100 px-3 py-2 gap-2 rounded-2", index===editIndex && "bg-panda-red text-invert")}>
                        <div className="d-flex flex-column w-100" onClick={() => setEditIndex(index)}>
                            <div className="d-flex flex-row justify-content-between align-items-center text-md">
                                <strong>{item["name"]}</strong>
                                <div className="d-flex flex-row align-items-center gap-2">
                                    <div>{`$${itemPrice.toFixed(2)}`}</div>
                                </div>
                            </div>
                            <div className="d-flex flex-column align-items-start text-sm mx-2">
                                {item["items"].map((e) => <div>{e.name}</div>)}
                            </div>
                        </div>
                        <DeleteIcon sx={{ fontSize: 36, color: clsx(index===editIndex ? "#ffffff" : "#d1282e") }} onClick={() => {
                            const modifiedCurrentCart = [...currentCart];
                            modifiedCurrentCart.splice(index, 1);
                            setEditIndex(modifiedCurrentCart.findLastIndex((e) => e["type"]==="meal"));
                            setCurrentCart(modifiedCurrentCart);
                        }} />
                    </div>
                );
            }
            else if(["A La Carte - S", "A La Carte - M", "A La Carte - L"].indexOf(item["name"])>=0) {
                item["items"].forEach((e) => {
                    let multiple = 1;
                    switch(item["name"]) {
                        case "A La Carte - M":
                            multiple = 2;
                            break;
                        case "A La Carte - L":
                            multiple = 3;
                            break;
                        default:
                    }
                    if(e["premium"]) itemPrice+=1.50*multiple;
                })
                itemList.push(
                    <div className="d-flex flex-column w-100 px-3 py-2">
                        <div className="d-flex flex-row justify-content-between align-items-center text-md">
                            <strong>{item["name"]}</strong>
                            <div className="d-flex flex-row align-items-center gap-2">
                                <div>{`$${itemPrice.toFixed(2)}`}</div>
                                <DeleteIcon sx={{ fontSize: 36, color: "#d1282e" }} onClick={() => {
                                    const modifiedCurrentCart = [...currentCart];
                                    modifiedCurrentCart.splice(index, 1);
                                    setCurrentCart(modifiedCurrentCart);
                                }} />
                            </div>
                        </div>
                        <div className="d-flex flex-column align-items-start text-sm mx-2">
                            {item["items"].map((e) => <div>{e.name}</div>)}
                        </div>
                    </div>
                );
            }
            else {
                itemList.push(
                    <div className="d-flex flex-column w-100 px-3 py-2">
                        <div className="d-flex flex-row justify-content-between align-items-center text-md">
                            <strong>{item["name"]}</strong>
                            <div className="d-flex flex-row align-items-center gap-2">
                                <div>{`$${itemPrice.toFixed(2)}`}</div>
                                <DeleteIcon sx={{ fontSize: 36, color: "#d1282e" }} onClick={() => {
                                    const modifiedCurrentCart = [...currentCart];
                                    modifiedCurrentCart.splice(index, 1);
                                    setCurrentCart(modifiedCurrentCart);
                                }} />
                            </div>
                        </div>
                    </div>
                );
            }
            price+=itemPrice;
        });

        const buttonData = {
            "itemType": ["Bowl", "Plate", "Bigger Plate", "A La Carte"],
            "letter": ["R", "M", "B", "C", "CB", "F", "V", "E"],
            "number": ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
            "other": ["SPRR", "CCRG", "EGGR", "AAPL", "DRNK", "WATR", "GTRD"],
            "size": ["S", "M", "L"]
        }
        let buttonMap = {"itemType": [], "letter": [], "number": [], "other": [], "size": []};

        console.log(currentCart);
        console.log(editIndex);

        for(const [key, val] of Object.entries(buttonData)) {
            let buttonDisabled = false;
            switch(key) {
                case "itemType":
                    buttonDisabled = currentSelection["other"] || 
                                    currentSelection["size"] ||
                                    currentSelection["letter"]==="E";
                    break;
                case "letter":
                case "number":
                    buttonDisabled = currentSelection["other"];
                    break;
                case "other":
                    buttonDisabled = currentSelection["itemType"] ||
                                    currentSelection["letter"] ||
                                    currentSelection["number"];
                    break;
                case "size":
                    buttonDisabled = (currentSelection["itemType"] && currentSelection["itemType"]!=="A La Carte");
                    break;
                default:
                    buttonDisabled = false;
            }

            val.forEach((content) => {
                // Special button cases
                if(content==="A La Carte" && !currentSelection["other"] && currentSelection["letter"]!=="E") {
                    buttonDisabled = false;
                }
                if(key==="number" && currentSelection["letter"]) {
                    buttonDisabled = availableNumList[currentSelection["letter"]].indexOf(content)<0;
                }
                if(key==="letter" && currentSelection["number"]) {
                    buttonDisabled = availableLetterList[currentSelection["number"]].indexOf(content)<0;
                }
                if(key==="size" && (currentSelection["letter"] || currentSelection["other"]) && !(currentSelection["itemType"] && currentSelection["itemType"]!=="A La Carte")) {
                    let availableSizes;
                    // Please don't do this in industry
                    try {
                        availableSizes = currentSelection["letter"] ?
                                        menuItemApi["entree"].concat(menuItemApi["side"]).concat(menuItemApi["appetizer"]).find((e) => currentSelection["letter"]===e.menu_code.substring(0, e.menu_code.length-1))["available_sizes"] :
                                        menuItemApi["appetizer"].concat(menuItemApi["drink"]).find((e) => buttonDictionary[currentSelection["other"]]===e.name)["available_sizes"];
                    }
                    catch {
                        availableSizes = {};
                    }

                    switch(content) {
                        case "S":
                            buttonDisabled = !Object.hasOwn(availableSizes, "small");
                            break;
                        case "M":
                            buttonDisabled = !Object.hasOwn(availableSizes, "medium");
                            break;
                        case "L":
                            buttonDisabled = !Object.hasOwn(availableSizes, "large");
                            break;
                        default:
                    }
                }

                buttonMap[key].push(
                    <button id={`${key}${content}`} className={
                        clsx(
                            "btn btn-item px-3 text-lg d-flex justify-content-center align-items-center", 
                            currentSelection[key]===content && " selected",
                            (key==="letter"||key==="number"||key==="size") && " square"
                        )
                    } 
                    onClick={() => {
                        if(currentSelection[key]===content) {
                            setCurrentSelection({...currentSelection, [key]: ""});
                        }
                        else {
                            let resetList = {};
                            switch(key) {
                                case "itemType":
                                    if(content!=="A La Carte") resetList = {"other": "", "size": ""};
                                    break;
                                case "letter":
                                    resetList = {"other": ""};
                                    if(content==="E") resetList["itemType"] = "";
                                    break;
                                case "number":
                                    resetList = {"other": ""};
                                    break;
                                case "other":
                                case "size":
                                    if(currentSelection["itemType"] && currentSelection["itemType"]!=="A La Carte") resetList = {"itemType": "", "letter": "", "number": ""};
                                    break;
                                default:
                                    buttonDisabled = false;
                            }
                            setCurrentSelection({...currentSelection, ...resetList, [key]: content});
                        }
                    }}
                    disabled={buttonDisabled}>{content}</button>
                );
            });
        }

        return (
            <div className="d-flex flex-column align-items-center vh-100">
                <div className="d-flex flex-row justify-content-center align-items-center gap-5 w-100 h-100 px-5 py-5">
                    <div className="d-flex flex-column justify-content-between align-items-start flex-grow-1 h-100 pr-3 gap-4">
                        <Link to='/home' className="d-flex flex-row align-items-center gap-2 text-black link-no-underline" >
                            <ArrowBackIcon sx={{ fontSize: 24 }} />
                            <div className="fw-bold text-md">Back</div>
                        </Link>
                        <div className="d-flex flex-column gap-1">
                            <div className="text-lg">Size</div>
                            <div className="d-flex flex-row gap-3">
                                {buttonMap["itemType"]}
                            </div>
                        </div>
                        <div className="d-flex flex-row gap-6">
                            <div className="d-flex flex-column gap-1">
                                <div className="text-lg">Type</div>
                                <div className="d-grid grid-cols-3 gap-2">
                                    {buttonMap["letter"]}
                                </div>
                            </div>
                            <div className="d-flex flex-column gap-1">
                                <div className="text-lg">Product</div>
                                <div className="d-grid grid-cols-3 gap-2">
                                    {buttonMap["number"]}
                                </div>
                            </div>
                        </div>
                        <div className="d-flex flex-row gap-6">
                            <div className="d-flex flex-column gap-1">
                                <div className="text-lg">Appetizer/Drink</div>
                                <div className="d-grid grid-cols-4 gap-3">
                                    {buttonMap["other"]}
                                </div>
                            </div>
                            <div className="d-flex flex-column gap-1">
                                <div className="text-lg">Size</div>
                                <div className="d-flex flex-row gap-2">
                                    {buttonMap["size"]}
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-secondary px-3 py-2 text-lg" onClick={() => {
                            // Inner if statements for each of these if statement blocks are used as sanitizers
                            // If new meal (including A La Carte), skips if A La Carte but no size
                            if(currentSelection["itemType"]) {
                                if(currentSelection["letter"] && currentSelection["number"] && (currentSelection["itemType"]!=="A La Carte" || currentSelection["size"])) {
                                    // Disregarding side and entree order for db_code since side, entree1, entree2, entree3 have no ordered meaning
                                    if(currentSelection["itemType"]!=="A La Carte") setEditIndex(currentCart.length);
                                    let dbCode = [itemTypeApi[itemType[currentSelection["itemType"]]["item_type"][0]]["uniqueid"], menuItemApi["entree"].concat(menuItemApi["side"]).find((e) => e.menu_code===currentSelection["letter"]+currentSelection["number"])["uniqueid"]];
                                    while(dbCode.length<5) {
                                        dbCode.push(0);
                                    }
                                    setCurrentCart([...currentCart, {
                                        "name": `${currentSelection["itemType"]}${!currentSelection["size"] ? "" : " - "+currentSelection["size"]}`,
                                        "items": [menuItemApi["entree"].concat(menuItemApi["side"]).find((e) => e.menu_code===currentSelection["letter"]+currentSelection["number"])],
                                        "price": itemTypeApi[itemType[currentSelection["itemType"]]["item_type"][0]]["price"],
                                        "type": currentSelection["itemType"]!=="A La Carte" ? "meal" : "item",
                                        "db_code": dbCode
                                    }]);
                                }
                            }
                            // If adding item to existing meal, skips if no meal in cart
                            else if(currentSelection["letter"]!=="E" && currentSelection["letter"] && currentSelection["number"]) {
                                if(currentCart.length!==0) {
                                    let dbCode = [...currentCart[editIndex]["db_code"].filter((e) => e!==0), menuItemApi["entree"].concat(menuItemApi["side"]).find((e) => e.menu_code===currentSelection["letter"]+currentSelection["number"])["uniqueid"]];
                                    while(dbCode.length<5) {
                                        dbCode.push(0);
                                    }
                                    currentCart.splice(editIndex, 1, {
                                        "name": currentCart[editIndex]["name"],
                                        "items": currentCart[editIndex]["items"].concat(menuItemApi["entree"].concat(menuItemApi["side"]).find((e) => e.menu_code===currentSelection["letter"]+currentSelection["number"])),
                                        "price": currentCart[editIndex]["price"],
                                        "type": "meal",
                                        "db_code": dbCode
                                    });
                                    setEditIndex(currentCart.findLastIndex((e) => e["type"]==="meal"));
                                    setCurrentCart(currentCart);
                                }
                            }
                            // If adding item (excluding A La Carte)
                            else {
                                if(currentSelection["size"]) {
                                    let selectedItem = currentSelection["letter"]==="E" ?
                                                    menuItemApi["appetizer"].find((e) => currentSelection["letter"]+currentSelection["number"]===e.menu_code) :
                                                    menuItemApi["appetizer"].concat(menuItemApi["drink"]).find((e) => buttonDictionary[currentSelection["other"]]===e.name);
                                    let itemType = "";

                                    switch(currentSelection["size"]) {
                                        case "S":
                                            itemType = selectedItem["available_sizes"]["small"];
                                            break;
                                        case "M":
                                            itemType = selectedItem["available_sizes"]["medium"];
                                            break;
                                        case "L":
                                            itemType = selectedItem["available_sizes"]["large"];
                                            break;
                                        default:
                                    }

                                    setCurrentCart([...currentCart, {
                                        "name": `${selectedItem["name"]} - ${currentSelection["size"]}`,
                                        "items": [selectedItem],
                                        "price": itemTypeApi[itemType]["price"],
                                        "type": "item",
                                        "db_code": [itemTypeApi[itemType]["uniqueid"], 0, 0, 0, 0]
                                    }]);
                                }
                            }
                            setCurrentSelection({"itemType": "", "letter": "", "number": "", "other": "", "size": ""});
                        }}>Add</button>
                    </div>
                    <div className="card cart d-flex flex-column justify-content-between align-items-center h-100 px-3 py-3">
                        <div className="d-flex flex-column w-100 gap-2 overflow-y-scroll">
                            {itemList}
                        </div>
                        <div className="d-flex flex-column w-100 px-3 py-3">
                            <div className="d-flex flex-row justify-content-between text-md">
                                <div>Subtotal</div>
                                <div>{`$${price.toFixed(2)}`}</div>
                            </div>
                            <div className="d-flex flex-row justify-content-between text-md">
                                <div>Estimated Tax</div>
                                <div>{`$${(price*SALES_TAX).toFixed(2)}`}</div>
                            </div>
                            <div className="d-flex flex-row justify-content-between text-lg border-top border-2">
                                <strong>Total</strong>
                                <strong>{`$${(price*(1+SALES_TAX)).toFixed(2)}`}</strong>
                            </div>
                            <button className="btn btn-secondary mt-4" onClick={() => {
                                console.log('checking out with db_codes: '+currentCart.map((e) => e.db_code));
                                fetch(
                                    process.env.REACT_APP_PROXY+'/api/checkout', {
                                        method : 'POST',
                                        headers : { 'Content-Type' : 'application/json'},
                                        body: JSON.stringify({
                                            "employee" : currentUser,
                                            "amount" : amount, // THIS IS THE AMOUNT OF ITEMS
                                            "dbcodes": currentCart.map((e) => e.db_code)
                                        })
                                    }   
                                );
                                setCurrentSelection({"itemType": "", "letter": "", "number": "", "other": "", "size": ""});
                                setCurrentCart([]);
                            }}><strong className="text-lg" onClick={() => {
                                setCurrentSelection({"itemType": "", "letter": "", "number": "", "other": "", "size": ""});
                                setCurrentCart([]);
                            }}>Checkout</strong></button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    else {
        return (
            <section className="card d-flex flex-column justify-content-center align-items-center vw-100 vh-100 gap-4 px-0">
                <div class="spinner-grow bg-panda-red" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </section>
        );
    }
}

export default Checkout;