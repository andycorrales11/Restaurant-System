import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

import "../css/menuboard.css";

import itemType from "../fixed_data/item_type.json";

import bowlImage from "../resources/icons/bowl.png";
import plateImage from "../resources/icons/plate.png";
import biggerPlateImage from "../resources/icons/bigger_plate.png";
import promotionalMaterial1 from "../resources/images/promotional_material1.jpg";
import promotionalMaterial2 from "../resources/images/promotional_material2.jpg";

function MenuBoard() {
    const [weather, setWeather] = useState({
        "tempf": 54,
        "tempc": 12,
        "description": "overcast clouds",
        "icon": "https://openweathermap.org/img/wn/04n@2x.png"
    });
    const [menuItemApi, setMenuItemApi] = useState(null);
    const [itemTypeApi, setItemTypeApi] = useState(null);
    const [currentPromotion, setCurrentPromotion] = useState(0);

    // Changing between promotional materials
    const promotionList = [promotionalMaterial1, promotionalMaterial2];
    useEffect(() => {
        const minuteInterval = setInterval(() => {
            setCurrentPromotion(currentPromotion!==promotionList.length-1 ? currentPromotion+1 : 0);
        }, 60000);
        return () => clearInterval(minuteInterval);
    }, []);

    useEffect(() => {
        async function fetchData() {
            try {
            const response = await fetch(process.env.REACT_APP_PROXY+'/api/menu');
                if (response.ok) {
                    const data = await response.json();
                    setMenuItemApi(data);
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
    
    document.documentElement.style.setProperty("--base-font-size", "1.1rem");

    useEffect(() => {
        async function fetchMenuItems() {
            try {
                const response = await fetch(process.env.REACT_APP_PROXY + "/api/menu");
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log("Fetched menu items:", data);
    
                setMenuItemApi(data);
            } catch (error) {
                console.error("Error fetching menu items:", error);
                setMenuItemApi([]);
            }
        }
        async function fetchItemTypes() {
            try {
                const response = await fetch(process.env.REACT_APP_PROXY + "/api/itemtype");
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log("Fetched item types:", data);
    
                setItemTypeApi(data);
            } catch (error) {
                console.error("Error fetching menu items:", error);
                setItemTypeApi({});
            }
        }
        async function fetchWeather() {
            console.log('data');
            try {
                const response = await fetch(process.env.REACT_APP_PROXY+'/api/weather');
                if (response.ok) {
                    const data = await response.json();
                    setWeather(data);
                }
                else {
                    console.log("response not ok");
                }
            }
            catch (error) {
                console.error('Network error:', error);
            }
        }
        const hourInterval = setInterval(() => fetchWeather(), 360000);

        fetchMenuItems();
        fetchItemTypes();
        fetchWeather();
        return () => clearInterval(hourInterval);
    }, []);

    // Use esc key to exit menu board screen
    const navigate = useNavigate();
    const exitScreen = useCallback((e) => {
        if(e.key==="Escape") {
            navigate('/home');
        }
    });
    useEffect(() => {
        document.addEventListener('keydown', exitScreen, false);
        return () => {
            document.removeEventListener('keydown', exitScreen, false);
        }
    }, [exitScreen]);
    

    const mealOptionsData = [
        {
            id: 1,
            type: "BOWL",
            calories: { min: 280, max: 1130, unit: "cal" },
            components: "1 Entree & 1 Side",
            price: { currency: "$", amount: 8.30 },
            image: bowlImage,
        },
        {
            id: 2,
            type: "PLATE",
            calories: { min: 430, max: 1640, unit: "cal" },
            components: "1 Entree & 1 Side",
            price: { currency: "$", amount: 9.80 },
            image: plateImage,
        },
        {
            id: 3,
            type: "BIGGER PLATE",
            calories: { min: 580, max: 2150, unit: "cal" },
            components: "1 Entree & 1 Side",
            price: { currency: "$", amount: 11.30 },
            image: biggerPlateImage,
        },
    ];

    const aLaCartBoxesData = [
        {
            size: "Sm",
            prices: [
                { currency: "$", amount: 5.20 },
                { currency: "$", amount: 6.70 },
            ],
        },
        {
            size: "Med",
            prices: [
                { currency: "$", amount: 8.50 },
                { currency: "$", amount: 11.50 },
            ],
        },
        {
            size: "Lg",
            prices: [
                { currency: "$", amount: 11.20 },
                { currency: "$", amount: 15.70 },
            ],
        },
    ];

    const sidesOptionsData = [
        {
            size: "Med",
            price: { currency: "$", amount: 4.50 },
        },
        {
            size: "Lg",
            price: { currency: "$", amount: 5.40 },
        },
    ];

    // const entreeChoicesData = [
    //     {
    //         id: 1,
    //         name: "The Original Orange Chicken",
    //         premium: true,
    //         calories: { value: 490, unit: "Cal" },
    //     },
    //     {
    //         id: 2,
    //         name: "Grilled Teriyaki Salmon",
    //         premium: false,
    //         calories: { value: 350, unit: "Cal" },
    //     },
    //     {
    //         id: 3,
    //         name: "Spicy Beef Bulgogi",
    //         premium: true,
    //         calories: { value: 550, unit: "Cal" },
    //     },
    //     {
    //         id: 4,
    //         name: "Vegetarian Fried Rice",
    //         premium: false,
    //         calories: { value: 300, unit: "Cal" },
    //     },
    //     {
    //         id: 5,
    //         name: "Sweet and Sour Pork",
    //         premium: true,
    //         calories: { value: 420, unit: "Cal" },
    //     },
    //     {
    //         id: 6,
    //         name: "Kung Pao Shrimp",
    //         premium: true,
    //         calories: { value: 460, unit: "Cal" },
    //     },
    //     {
    //         id: 7,
    //         name: "General Tso's Chicken",
    //         premium: false,
    //         calories: { value: 400, unit: "Cal" },
    //     },
    //     {
    //         id: 8,
    //         name: "Mongolian Beef",
    //         premium: true,
    //         calories: { value: 530, unit: "Cal" },
    //     },
    //     {
    //         id: 9,
    //         name: "Honey Garlic Chicken",
    //         premium: false,
    //         calories: { value: 380, unit: "Cal" },
    //     },
    // ];

    return (
        <div className="menu-board-container nunito overflow-x-scroll">
            <div className="inner-rectangle">
                <div>
                    {promotionList.map((e, i) => <img alt="Promotional Material" src={e} className={clsx("vh-100 transition-all", i!==0 && "position-absolute top-0 left-0", currentPromotion===i ? "opacity-100" : "opacity-0")} />)}
                </div>
                <div className="left-section px-5 py-4 m-4">
                    {/* Existing "PICK A MEAL" Box */}
                    <div className="upper-left-fourth">
                        {/* Header Section */}
                        <div className="header text-xl">
                            PICK A MEAL
                        </div>

                        {/* Meal Options */}
                        <div className="meal-options">
                            {mealOptionsData.map(option => (
                                <div className="meal-option d-flex flex-row gap-4" key={option.id}>
                                    <img src={option.image} alt={option.type} className="img-h-md img-w-md object-fit-contain" />
                                    <div className="meal-details">
                                        <div className="meal-top">
                                            <span className="meal-type text-rl">{option.type}</span>
                                            <span className="meal-calories text-md fw-semibold">
                                                {option.calories.min} - {option.calories.max} {option.calories.unit}
                                            </span>
                                        </div>
                                        <div className="meal-bottom">
                                            <span className="meal-components text-md fw-medium">{option.components}</span>
                                            <span className="meal-price text-md fw-bold">
                                                starts at {option.price.currency}{option.price.amount.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* New Right Section: Entree Choices */}
                {
                    menuItemApi ?
                    <div className="right-section px-5 py-4 m-4">
                        <div className="entree-choices-box">
                            <div className="entree-choices-header text-xl">
                                ENTREE CHOICES
                            </div>
                            <div className="entree-choices-list">
                                {menuItemApi.entree.map(item => (
                                    <div className="entree-choice" key={item.uniqueid}>
                                        <div className="choice-name text-lg">{item.name}</div>
                                        <div className={clsx("text-md", item.premium ? "premium-pill" : "d-none")}>Premium</div>
                                        {/* <div className="choice-calories">
                                            Calories: {item.calories} Cal
                                        </div> */}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div> :
                    <section className="right-section d-flex flex-column justify-content-center align-items-center">
                        <div class="bg-panda-red spinner-grow" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </section>
                }

                {/* Newer Righter Section: Side Choices and A La Carte Boxes */}
                {
                    menuItemApi ?
                    <div className="right-section px-5 py-4 m-4">
                        <div className="entree-choices-box">
                            <div className="entree-choices-header text-xl">
                                SIDE CHOICES
                            </div>
                            <div className="entree-choices-list">
                                {menuItemApi.side.map(item => (
                                    <div className="entree-choice" key={item.uniqueid}>
                                        <div className="choice-name text-lg">{item.name}</div>
                                        <div className={clsx("text-md", item.premium ? "premium-pill" : "d-none")}>Premium</div>
                                        {/* <div className="choice-calories">
                                            Calories: {item.calories} Cal
                                        </div> */}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* New "A LA CART BOXES" Section */}
                        <div className="lower-left-box">
                            {/* Header Section */}
                            <div className="a-la-cart-header text-xl">
                                A LA CARTE BOXES
                            </div>

                            {/* Entrées Header */}
                            <div className="a-la-cart-entrees">
                                <div className="entrees-header">
                                    <div className="entrees-title">
                                        <span className="entrees-bold text-rl">ENTREES</span> <span className="entrees-cal text-md fw-semibold">580-2150 cal</span>
                                    </div>
                                    <div className="premium-entree text-md">
                                        <div className="premium">Premium</div>
                                        <div className="entree">Entree</div>
                                    </div>
                                </div>
                            </div>

                            {/* Entrées Sizes Section */}
                            <div className="a-la-cart-sizes mb-4">
                                {aLaCartBoxesData.map((box, index) => (
                                    <div className="size-row" key={index}>
                                        <div className="size-label text-rl">{box.size}</div>
                                        <div className="size-prices">
                                            {box.prices.map((priceObj, idx) => (
                                                <React.Fragment key={idx}>
                                                    <div className="price-box text-md">
                                                        {priceObj.currency}{priceObj.amount.toFixed(2)}
                                                    </div>
                                                    {/* Add price-bar between price-boxes except after the last one */}
                                                    {idx < box.prices.length - 1 && <div className="price-bar"></div>}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Sides Header */}
                            <div className="a-la-cart-entrees">
                                <div className="entrees-header">
                                    <div className="entrees-title">
                                        <span className="entrees-bold text-rl">SIDES</span> <span className="entrees-cal text-md fw-semibold">90-1040 cal</span>
                                    </div>
                                    {/* Placeholder div to maintain layout consistency */}
                                    <div className="premium-entree">
                                        {/* Empty to align with Entrées section */}
                                    </div>
                                </div>
                            </div>

                            {/* Sides Sizes Section */}
                            <div className="a-la-cart-sizes">
                                {sidesOptionsData.map((side, index) => (
                                    <div className="size-row" key={index}>
                                        <div className="size-label text-rl">{side.size}</div>
                                        <div className="size-prices-single">
                                            <div className="price-box-single text-md">
                                                {side.price.currency}{side.price.amount.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div> :
                    <section className="right-section d-flex flex-column justify-content-center align-items-center">
                        <div class="bg-panda-red spinner-grow" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </section>
                }

                
                {/* Newerier Righterier Section: Appetizer Choices */}
                {
                    menuItemApi ?
                    <div className="right-section px-5 py-4 m-4">
                        <div className="entree-choices-box">
                            <div className="entree-choices-header text-xl">
                                MORE CHOICES
                            </div>
                            <div className="d-flex flex-row justify-content-between">
                                <div></div>
                                <div className="d-flex flex-row">
                                    <div className="size-column price-box text-lg">Sm</div>
                                    <div className="size-column price-box text-lg">Med</div>
                                    <div className="size-column price-box text-lg">Lg</div>
                                </div>
                                {/* <div className="choice-calories">
                                    Calories: {item.calories} Cal
                                </div> */}
                            </div>
                            <div className="entree-choices-list">
                                {menuItemApi.appetizer.map(item => (
                                    <div className="entree-choice" key={item.uniqueid}>
                                        <div className="choice-name text-lg">{item.name}</div>
                                        <div className="d-flex flex-row">
                                            <div className="price-box text-md">{Object.hasOwn(item.available_sizes, "small") ? "$"+itemTypeApi[item.available_sizes.small].price.toFixed(2) : ""}</div>
                                            <div className="price-box text-md">{Object.hasOwn(item.available_sizes, "medium") ? "$"+itemTypeApi[item.available_sizes.medium].price.toFixed(2) : ""}</div>
                                            <div className="price-box text-md">{Object.hasOwn(item.available_sizes, "large") ? "$"+itemTypeApi[item.available_sizes.large].price.toFixed(2) : ""}</div>
                                        </div>
                                        {/* <div className="choice-calories">
                                            Calories: {item.calories} Cal
                                        </div> */}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="entree-choices-box">
                            <div className="entree-choices-header text-xl">
                                DRINKS
                            </div>
                            <div className="d-flex flex-row justify-content-between">
                                <div></div>
                                <div className="d-flex flex-row">
                                    <div className="size-column price-box text-lg">Sm</div>
                                    <div className="size-column price-box text-lg">Med</div>
                                    <div className="size-column price-box text-lg">Lg</div>
                                </div>
                                {/* <div className="choice-calories">
                                    Calories: {item.calories} Cal
                                </div> */}
                            </div>
                            <div className="entree-choices-list">
                                {menuItemApi.drink.map(item => (
                                    <div className="entree-choice" key={item.uniqueid}>
                                        <div className="choice-name text-lg">{item.name==="Soft Drink" ? item.name : item.name+" (20oz)"}</div>
                                        <div className="d-flex flex-row">
                                            <div className="price-box text-md">{Object.hasOwn(item.available_sizes, "small") ? "$"+itemTypeApi[item.available_sizes.small].price.toFixed(2) : ""}</div>
                                            <div className="price-box text-md">{Object.hasOwn(item.available_sizes, "medium") ? "$"+itemTypeApi[item.available_sizes.medium].price.toFixed(2) : ""}</div>
                                            <div className="price-box text-md">{Object.hasOwn(item.available_sizes, "large") ? "$"+itemTypeApi[item.available_sizes.large].price.toFixed(2) : ""}</div>
                                        </div>
                                        {/* <div className="choice-calories">
                                            Calories: {item.calories} Cal
                                        </div> */}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div> :
                    <section className="right-section d-flex flex-column justify-content-center align-items-center">
                        <div class="bg-panda-red spinner-grow" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </section>
                }
                {/* Weather Box */}
                <div className="weather-box pl-2 pr-5 py-4">
                    <div className="d-flex flex-row align-items-center gap-2">
                        <img alt={weather.description} src={weather.icon} className="img-h-md icon-shadow" />
                        <div className="d-flex flex-column">
                            <div className="text-xl text-nowrap">{weather.tempf}°F / {weather.tempc}°C <span className="fw-bold text-lg">{weather.description.split(' ').map((e) => e[0].toUpperCase()+e.substring(1)).join(' ')}</span></div>
                            <div className="text-secondary subtext text-md">College Station</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MenuBoard;
