import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { useNavigate, useLocation } from "react-router-dom";

import ConsumerTopbar from "../components/ConsumerTopbar";
import MenuItemCard from "../components/MenuItemCard";

import itemType from "../fixed_data/item_type.json";

import woktossImage from "../resources/images/woktoss.gif";

function ConsumerMeal({ title="Menu", startingPrice }) {
    let ssiPreset = [];
    let seiPreset = [];
    
    let navigate = useNavigate();
    let location = useLocation();

    if(location.state && Object.hasOwn(location.state, "presetLSIndex")) {
        const lsCart = JSON.parse(localStorage.getItem("cart"));
        // ! Temp solution, change if we implement multiple side items
        // See AddMealBar for reference
        ssiPreset.push(lsCart[location.state.presetLSIndex]["items"][0]);
        seiPreset.push(...lsCart[location.state.presetLSIndex]["items"].slice(1));
    }

    const [selectedSideItem, setSelectedSideItem] = useState(ssiPreset);
    const [selectedEntreeItem, setSelectedEntreeItem] = useState(seiPreset);
    const [menuItemApi, setMenuItemApi] = useState(null);
    const [itemTypeApi, setItemTypeApi] = useState(null);

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

    if(menuItemApi && itemTypeApi) {
        // Default to Bowl config if not in fixed data
        let sideLimit = 1;
        let entreeLimit = 1;
        if(title in itemType) {
            sideLimit = itemType[title]["side_count"];
            entreeLimit = itemType[title]["entree_count"];
        }

        // Calculate Price
        let price = startingPrice;
        selectedSideItem.forEach((orderItem) => {
            if(menuItemApi.side.find((e) => e.uniqueid===orderItem.uniqueid).premium) price+=1.50;
        });
        selectedEntreeItem.forEach((orderItem) => {
            if(menuItemApi.entree.find((e) => e.uniqueid===orderItem.uniqueid).premium) price+=1.50;
        });

        let sideItemCards = [];
        let entreeItemCards = [];
        menuItemApi.side.forEach((val) => sideItemCards.push(
            <div className="w-100 h-100" onClick={() => {
                let modifiedSideItem = selectedSideItem;
                if(modifiedSideItem.find((e) => e.uniqueid===val.uniqueid)!==undefined) {
                    modifiedSideItem = modifiedSideItem.filter((e) => e.uniqueid!==val.uniqueid);
                    setSelectedSideItem(modifiedSideItem);
                }
                else {
                    if(modifiedSideItem.length>=sideLimit) modifiedSideItem.shift();
                    modifiedSideItem = modifiedSideItem.concat(val);
                    setSelectedSideItem(modifiedSideItem);
                }
            }}>
                <MenuItemCard title={val.name} img={val.blob} premium={val.premium} className={clsx(
                    selectedSideItem.find((e) => e.uniqueid===val.uniqueid)!==undefined && "btn-card-selected"
                )} />
            </div>
        ));
        menuItemApi.entree.forEach((val) => entreeItemCards.push(
            <div className="w-100 h-100" onClick={() => {
                let modifiedEntreeItem = selectedEntreeItem;
                if(modifiedEntreeItem.find((e) => e.uniqueid===val.uniqueid)!==undefined) {
                    modifiedEntreeItem = modifiedEntreeItem.filter((e) => e.uniqueid!==val.uniqueid)
                    setSelectedEntreeItem(modifiedEntreeItem);
                }
                else {
                    if(modifiedEntreeItem.length>=entreeLimit)  modifiedEntreeItem.shift();
                    while(modifiedEntreeItem.length<entreeLimit) {
                        modifiedEntreeItem = modifiedEntreeItem.concat(val);
                    }
                    setSelectedEntreeItem(modifiedEntreeItem);
                }
            }}>
                <MenuItemCard
                    qb={
                        selectedEntreeItem.find((e) => e.uniqueid===val.uniqueid)!==undefined && title!=="Bowl" ? 
                        <div id={`quantButton${val.uniqueid}`} className="d-flex flex-row justify-content-center align-items-center gap-4 bg-white text-black rounded-2" onClick={(e) => e.stopPropagation()}>
                            <button 
                                id="quantButtonSub" 
                                className="btn btn-quant" 
                                onClick={() => setSelectedEntreeItem(selectedEntreeItem.splice(selectedEntreeItem.findIndex((e) => e.uniqueid===val.uniqueid), 1))} 
                                disabled={selectedEntreeItem.filter((e) => e.uniqueid===val.uniqueid).length<=0}>-</button>
                            <div>{selectedEntreeItem.filter((e) => e.uniqueid===val.uniqueid).length}</div>
                            <button 
                                id="quantButtonAdd" 
                                className="btn btn-quant" 
                                onClick={() => {
                                    let modifiedEntreeItem = selectedEntreeItem;
                                    if(selectedEntreeItem.length>=entreeLimit) {
                                        modifiedEntreeItem.splice(modifiedEntreeItem.findIndex((e) => e.uniqueid!==val.uniqueid), 1).at(0);
                                    }
                                    while(modifiedEntreeItem.length<entreeLimit) {
                                        modifiedEntreeItem = modifiedEntreeItem.concat(val);
                                    }
                                    setSelectedEntreeItem(modifiedEntreeItem);
                                }}
                                disabled={selectedEntreeItem.filter((e) => e.uniqueid===val.uniqueid).length>=entreeLimit}>+</button>
                        </div> :
                        ""
                    }
                    uniqueid={val.uniqueid} title={val.name} img={val.blob} premium={val.premium}
                    className={clsx(selectedEntreeItem.find((e) => e.uniqueid===val.uniqueid)!==undefined && "btn-card-selected")}
                />
            </div>
        ));

        return (
            <div className="d-flex flex-column align-items-center atkinson">
                <ConsumerTopbar title={title} />
                <div className="d-flex flex-row justify-content-between align-items-center position-fixed bottom-0 z-2 w-100 bg-white card-shadow">
                    <strong className="text-lg px-5 py-4">{`$${price.toFixed(2)}`}</strong>
                    <button className="btn btn-secondary w-100 h-100 rounded-0" disabled={selectedSideItem.length!==sideLimit || selectedEntreeItem.length!==entreeLimit} onClick={() => {
                        let ccStr = localStorage.getItem("cart");
                        let currentCart = [];
                        console.log(selectedEntreeItem, selectedSideItem);
                        let dbCode = [ itemTypeApi[itemType[title]["item_type"][0]]["uniqueid"], ...selectedSideItem.concat(selectedEntreeItem).map((e) => e.uniqueid)];
                        while(dbCode.length<5) {
                            dbCode.push(0);
                        }
                        if(ccStr!=null) {
                            currentCart = JSON.parse(ccStr);

                            // If order is being modified, change part of the menu and return to previous screen
                            if(location.state && Object.hasOwn(location.state, "presetLSIndex")) {
                                currentCart[location.state.presetLSIndex] = {
                                    "name": title,
                                    "items": selectedSideItem.concat(selectedEntreeItem),
                                    "price": price,
                                    "type": "meal",
                                    "db_code": dbCode
                                };
                                localStorage.setItem("cart", JSON.stringify(currentCart));
                                return navigate(-1);;
                            }
                        }
                        currentCart.push({
                            "name": title,
                            "items": selectedSideItem.concat(selectedEntreeItem),
                            "price": price,
                            "type": "meal",
                            "db_code": dbCode
                        });
                        localStorage.setItem("cart", JSON.stringify(currentCart));
                        return navigate(-1);
                    }}
                    onFocus={() => {speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance(location.state && Object.hasOwn(location.state, "presetLSIndex") ? "Modify Order" : "Add to Order"))}}>
                        <div className="text-lg py-4">{clsx(location.state && Object.hasOwn(location.state, "presetLSIndex") ? "Modify Order" : "Add to Order")}</div>
                    </button>
                </div>
                <div className="d-flex flex-column gap-4 w-fit px-5 pt-4 pb-8">
                    <div>
                        <div className="text-xl">Step 1</div>
                        <div className="text-sm subtext">Choose a Side</div>
                    </div>
                    <div className="d-grid grid-cols-4 justify-content-center align-items-center gap-6 w-100">
                        {sideItemCards}
                    </div>
                    <div>
                        <div className="text-xl">Step 2</div>
                        <div className="text-sm subtext">
                            {clsx(
                                title==="Bowl" && "Choose an Entrée",
                                title==="Plate" && "Choose Two Entrées",
                                title==="Bigger Plate" && "Choose Three Entrées"
                            )}
                        </div>
                    </div>
                    <div className="d-grid grid-cols-4 justify-content-center align-items-center gap-6 w-100">
                        {entreeItemCards}
                    </div>
                </div>
            </div>
        );
    }
    else {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center vw-100 vh-100">
                <img alt="Loading..." src={woktossImage} className="img-h-lg" />
            </div>
        );
    }
}

export default ConsumerMeal;