import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";

import ConsumerTopbar from "../components/ConsumerTopbar";
import ConsumerBottombar from "../components/ConsumerBottombar";
import MenuItemCard from "../components/MenuItemCard";

import itemType from "../fixed_data/item_type.json";

import woktossImage from "../resources/images/woktoss.gif";

function ConsumerItem({ title = "Menu" }) {
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedSize, setSelectedSize] = useState("medium");
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

    let navigate = useNavigate();

    if(menuItemApi && itemTypeApi) {
        let itemCards = [];

        itemType[title]["categories"].forEach((category) => {
            menuItemApi[category].forEach((item) => {
                itemCards.push(
                    <MenuItemCard
                        title={item["name"]}
                        img={item["blob"]}
                        premium={item["premium"]}
                        onClick={() =>
                            handleItemClick(item)
                        }
                    />
                );
            });
        });

        const handleItemClick = (item) => {
            setSelectedItem(item);
            setSelectedSize(Object.keys(item["available_sizes"])[0]);
        };

        const handleCloseModal = () => {
            setSelectedItem(null);
        };

        const handleSizeChange = (size) => {
            setSelectedSize(size);
        };

        return (
            <div className="d-flex flex-column align-items-center atkinson">
                <ConsumerTopbar title={title} />
                <ConsumerBottombar />
                {selectedItem && (
                    <div className="modal-overlay" onClick={handleCloseModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="modal-close px-4" onClick={handleCloseModal} onFocus={() => {speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance("Close item selection"))}}>
                                &times;
                            </button>
                            <h2 className="text-lg px-6">{selectedItem["name"]}</h2>
                            <div className="large-product-img-container">
                                <img src={selectedItem["blob"]} alt={selectedItem["name"]} className="img-w-xl" />
                            </div>
                            <div className="size-options d-flex flex-row gap-4">
                                <button
                                    className={`size-option text-md ${selectedSize === "small" ? "active" : ""} ${Object.keys(selectedItem["available_sizes"]).indexOf("small")<0 && "d-none"}`}
                                    onClick={() => handleSizeChange("small")}
                                    onFocus={() => {speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance(`Small ${selectedItem["name"]}`))}}
                                >
                                    Small <span>${clsx(Object.keys(selectedItem["available_sizes"]).indexOf("small")<0 ? {} : (itemTypeApi[selectedItem["available_sizes"]["small"]]["price"] + (selectedItem["premium"] ? 1.50 : 0.00)).toFixed(2))}</span>
                                </button>
                                <button
                                    className={`size-option text-md ${selectedSize === "medium" ? "active" : ""} ${Object.keys(selectedItem["available_sizes"]).indexOf("medium")<0 && "d-none"}`}
                                    onClick={() => handleSizeChange("medium")}
                                    onFocus={() => {speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance(`${["Aquafina", "Gatorade"].indexOf(selectedItem["Name"])<0 ? "Medium" : "20 ounce"} ${selectedItem["name"]}`))}}
                                >
                                    {clsx(["Aquafina", "Gatorade"].indexOf(selectedItem["name"])<0 ? "Medium" : "20oz")} <span>${clsx(Object.keys(selectedItem["available_sizes"]).indexOf("medium")<0 ? {} : (itemTypeApi[selectedItem["available_sizes"]["medium"]]["price"] + (selectedItem["premium"] ? 3.00 : 0.00)).toFixed(2))}</span>
                                </button>
                                <button
                                    className={`size-option text-md ${selectedSize === "large" ? "active" : ""} ${Object.keys(selectedItem["available_sizes"]).indexOf("large")<0 && "d-none"}`}
                                    onClick={() => handleSizeChange("large")}onFocus={() => {speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance(`Large ${selectedItem["name"]}`))}}
                                >
                                    Large <span>${clsx(Object.keys(selectedItem["available_sizes"]).indexOf("large")<0 ? {} : (itemTypeApi[selectedItem["available_sizes"]["large"]]["price"] + (selectedItem["premium"] ? 4.50 : 0.00)).toFixed(2))}</span>
                                </button>
                            </div>
                            <button className="add-to-order-btn text-md" onClick={() => {
                                let ccStr = localStorage.getItem("cart");
                                let currentCart = [];
                                let dbCode = [itemTypeApi[selectedItem["available_sizes"][selectedSize]]["uniqueid"]];
                                if(title==="A La Carte") dbCode.push(selectedItem["uniqueid"]);
                                while(dbCode.length<5) {
                                    dbCode.push(0);
                                }
                                if(ccStr!=null) {
                                    currentCart = JSON.parse(ccStr);
                                }
                                currentCart.push({
                                    "name": `${selectedSize.charAt(0).toUpperCase()+selectedSize.substring(1)} ${selectedItem["name"]}`,
                                    "items": [selectedItem],
                                    "price": itemTypeApi[selectedItem["available_sizes"][selectedSize]]["price"] + (selectedItem["premium"] ? (1.50 * (selectedSize==="large" ? 3 : (selectedSize==="medium" ? 2 : 1))) : 0.00),
                                    "type": "item",
                                    "db_code": dbCode
                                });
                                localStorage.setItem("cart", JSON.stringify(currentCart));
                                return navigate("/consumer/itemtype");
                            }}
                            onFocus={() => {speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance(title))}}>Add To Order</button>
                        </div>
                    </div>
                )}
                <div className="d-grid grid-cols-4 justify-content-center align-items-center gap-6 w-fit px-5 pt-5 pb-8">
                    {itemCards}
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

export default ConsumerItem;