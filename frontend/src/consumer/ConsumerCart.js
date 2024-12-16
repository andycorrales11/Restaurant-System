import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CreditCardIcon from '@mui/icons-material/CreditCard';

import ConsumerTopbar from "../components/ConsumerTopbar";

import itemType from "../fixed_data/item_type.json";

function ConsumerCart() {
    const [currentCart, setCurrentCart] = useState(JSON.parse(localStorage.getItem("cart")));
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [orderId, setOrderId] = useState(null);

    // College Station sales tax rate
    const SALES_TAX = 0.0825;

    let price = 0;
    let cartCardList = [];
    let amount = 0;

    const navigate = useNavigate();

    if(currentCart!=null) {
        currentCart.forEach((cartItem, index) => {
            amount++;
            if(["Bowl", "Plate", "Bigger Plate"].indexOf(cartItem["name"])>=0) {
                cartCardList.push(
                    <div id={`cartItem${index}`} className="d-flex flex-row w-100 gap-4 pt-4 transition-all">
                        <img src={itemType[cartItem["name"]]["blob"]} alt={`${cartItem["name"]} in cart`} className="img-w-md object-fit-contain itemtype" />
                        <div className="d-flex flex-column w-100">
                            <div className="d-flex flex-row justify-content-between align-items-center text-lg">
                                <div>{cartItem["name"]}</div>
                                <div>{`$${cartItem["price"].toFixed(2)}`}</div>
                            </div>
                            <div className="d-flex flex-column align-items-start text-sm mx-2">
                                {cartItem["items"].map((e) => <div>{e.name}</div>)}
                            </div>
                            <div className="d-flex flex-row w-100 gap-4 mt-3">
                                <Link 
                                    to={`/consumer/itemtype/${cartItem["name"].replaceAll(" ", "").toLowerCase()}`}
                                    state={{ presetLSIndex: index }}
                                    className="btn btn-secondary flex-grow-1 py-2 text-md"
                                    onFocus={() => {speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance(`Edit ${cartItem["name"]} with ${cartItem["items"].map((e) => e.name).join(" and ")}`))}}
                                >
                                    Edit
                                </Link>
                                <button className="btn btn-secondary flex-grow-1 py-2 text-md" onClick={() => {
                                    const newCart = currentCart.filter((e) => e!==cartItem);
                                    const cartItemCard = document.getElementById(`cartItem${index}`);
                                    cartItemCard.className = cartItemCard.className+" opacity-0 translate-up";
                                    localStorage.setItem("cart", JSON.stringify(newCart));
                                    setTimeout(() => {
                                        setCurrentCart(newCart);
                                        cartItemCard.className = cartItemCard.className.replace(" opacity-0 translate-up", "");
                                    }, 150);
                                }}
                                onFocus={() => {speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance(`Remove ${cartItem["name"]} with ${cartItem["items"].map((e) => e.name).join(" and ")}`))}}>Remove</button>
                            </div>
                        </div>
                    </div>
                );
            }
            else {
                cartCardList.push(
                    <div id={`cartItem${index}`} className="d-flex flex-row w-100 gap-4 pt-4 transition-all">
                        <img src={cartItem["items"][0]["blob"]} alt={`${cartItem["name"]} in cart`} className="img-w-md object-fit-contain" />
                        <div className="d-flex flex-column w-100">
                            <div className="d-flex flex-row justify-content-between align-items-center text-lg">
                                <div>{cartItem["name"]}</div>
                                <div>{`$${cartItem["price"].toFixed(2)}`}</div>
                            </div>
                            <div className="d-flex flex-row w-100 gap-4 mt-3">
                                <button className="btn btn-secondary flex-grow-1 py-2 text-md" onClick={() => {
                                    const newCart = currentCart.filter((e) => e!==cartItem);
                                    const cartItemCard = document.getElementById(`cartItem${index}`);
                                    cartItemCard.className = cartItemCard.className+" opacity-0 translate-up";
                                    localStorage.setItem("cart", JSON.stringify(newCart));
                                    setTimeout(() => {
                                        setCurrentCart(newCart);
                                        cartItemCard.className = cartItemCard.className.replace(" opacity-0 translate-up", "");
                                    }, 150);
                                }}
                                onFocus={() => {speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance(`Remove ${cartItem["name"]}`))}}>Remove</button>
                            </div>
                        </div>
                    </div>
                );
            }
            price+=cartItem["price"];
        });
    }

    return (
        <div className="d-flex flex-column align-items-center vh-100 atkinson">
            <ConsumerTopbar title={"Your Order"} hasCartButton={false} />
            {
                orderId &&
                <div className="modal-overlay">
                    <div className="modal-content d-flex flex-column justify-content-center align-items-center w-50 h-50">
                        <h2 className="text-lg">Your order ID is:</h2>
                        <div className="front-text">{orderId}</div>
                    </div>
                </div>
            }
            {
                (paymentMethod&&!orderId) && (
                <div className="modal-overlay" onClick={() => setPaymentMethod(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close px-4" onClick={() => setPaymentMethod(false)}>
                            &times;
                        </button>
                        <h2 className="text-lg">Select Payment Method</h2>
                        <div className="size-options d-flex flex-row gap-4">
                            <button
                                className={`size-option d-flex flex-column justify-content-start align-items-center text-md ${paymentMethod === "dining_dollars" ? "active" : ""}`}
                                onClick={() => setPaymentMethod("dining_dollars")}
                                onFocus={() => {speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance('Pay with dining dollars'))}}
                            >
                                <LocalAtmIcon sx={{ fontSize: 64 }} />
                                <div>Dining Dollars</div>
                            </button>
                            <button
                                // I hate Maroon Meals
                                disabled={price>9.00}
                                className={`size-option d-flex flex-column justify-content-start align-items-center text-md ${paymentMethod === "maroon_meals" ? "active" : ""}`}
                                onClick={() => setPaymentMethod("maroon_meals")}
                                onFocus={() => {speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance('Pay with maroon meals'))}}
                            >
                                <ThumbUpIcon sx={{ fontSize: 64 }} />
                                <div>Maroon Meals</div>
                            </button>
                            <button
                                className={`size-option d-flex flex-column justify-content-start align-items-center text-md ${paymentMethod === "card" ? "active" : ""}`}
                                onClick={() => setPaymentMethod("card")}
                                onFocus={() => {speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance('Pay with card'))}}
                            >
                                <CreditCardIcon sx={{ fontSize: 64 }} />
                                <div>Card</div>
                            </button>
                        </div>
                        <button className="add-to-order-btn text-md" onClick={async () => {
                        const rewardsData = window.localStorage.getItem("rewards");
                        try {
                            const response = await fetch(
                                process.env.REACT_APP_PROXY+'/api/checkout'+(rewardsData ? `?email=${JSON.parse(rewardsData).email}` : ""), {
                                    method : 'POST',
                                    headers : { 'Content-Type' : 'application/json'},
                                    body: JSON.stringify({
                                        "employee" : 9,
                                        "amount" : amount, // THIS IS THE AMOUNT OF ITEMS
                                        "dbcodes": currentCart.map((e) => e.db_code)
                                    })
                                }
                            );
                            if (response.ok) {
                                const data = await response.json();
                                setOrderId(data[0]);
                                setTimeout(() => navigate('/consumer'), 2000);
                            }
                            else {
                                console.log("response not ok");
                            }
                        }
                        catch (error) {
                            console.error('Network error:', error);
                        }
                        }}
                        onFocus={() => {speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance(paymentMethod==="maroon_meals" ? "Use Maroon Meals" : `Pay $${(paymentMethod==="dining_dollars" ? price : price*(1+SALES_TAX)).toFixed(2)}`))}}
                        >{paymentMethod==="maroon_meals" ?
                            "Use Maroon Meals" : 
                            `Pay $${(paymentMethod==="dining_dollars" ? price : price*(1+SALES_TAX)).toFixed(2)}`}
                        </button>
                    </div>
                </div>)
            }
            <div className="d-flex flex-row justify-content-center align-items-center gap-5 w-100 h-100 px-5 py-5 overflow-hidden">
                <div className="d-flex flex-column justify-content-start align-items-center flex-grow-1 h-100 pr-3 gap-4 divide-y overflow-y-scroll">
                    {cartCardList}
                </div>
                <div className="card cart d-flex flex-column justify-content-between align-items-center h-100 px-5 py-5 overflow-hidden">
                    <div className="text-xl">Order Summary</div>
                    <div className="d-flex flex-column w-100">
                        <div className="d-flex flex-row justify-content-between text-md">
                            <div>Subtotal</div>
                            <div translate="no">{`$${price.toFixed(2)}`}</div>
                        </div>
                        <div className="d-flex flex-row justify-content-between text-md">
                            <div>Estimated Tax</div>
                            <div translate="no">{`$${(price*SALES_TAX).toFixed(2)}`}</div>
                        </div>
                        <div className="d-flex flex-row justify-content-between text-lg border-top border-2">
                            <strong>Total</strong>
                            <strong translate="no">{`$${(price*(1+SALES_TAX)).toFixed(2)}`}</strong>
                        </div>
                        <button className="btn btn-secondary mt-4" onClick={() => setPaymentMethod("dining_dollars")} onFocus={() => {speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance('Checkout order'))}}><strong className="text-lg">Checkout</strong></button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConsumerCart;