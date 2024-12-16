import React, { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { Link, useNavigate } from "react-router-dom";
import Dropdown from 'react-bootstrap/Dropdown';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import MicIcon from '@mui/icons-material/Mic';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TranslateIcon from '@mui/icons-material/Translate';

import itemType from "../fixed_data/item_type.json";

// Dictation processing area
// Global variable because it should only be rendered once
// Pulled from a combination of a bunch of articles, MDN Web Docs, and Google's Web Speech API Demonstration
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;

function ConsumerTopbar({ front=false, hasBackButton=true, title="", hasDictateButton=true, hasMagnifyButton=true, hasLanguageButton=true, hasCartButton=true }) {
    const [time, setTime] = useState((new Date()).toLocaleTimeString("en-US", {hour: "numeric", minute: "2-digit"}));
    const [weather, setWeather] = useState({
        "tempf": 54,
        "tempc": 12,
        "description": "overcast clouds",
        "icon": "https://openweathermap.org/img/wn/04n@2x.png"
    })
    const [selectedLang, setSelectedLang] = useState(document.cookie.split("; ").filter((e) => e.includes("googtrans")).length!==0 ? document.cookie.split("; ").filter((e) => e.includes("googtrans"))[0].split("/")[2] : "en");
    const [listening, setListening] = useState(false);
    const [listeningKeyPress, setListeningKeyPress] = useState(false);
    const [dictationText, setDictationText] = useState("");
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [currentCart, setCurrentCart] = useState(localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : []);
    const [menuItemApi, setmenuItemApi] = useState(null);

    // Speech synthesis
    const keyAssist = useCallback((e) => {
        if((e.key==="Tab"||e.key==="t")&&window.localStorage.getItem('tts')!=='true') {
            speechSynthesis.speak(new SpeechSynthesisUtterance("Text to speech on. Press S to dictate order."));
            window.localStorage.setItem('tts', 'true');
        }
        if(e.key==="s"&&!listening) {
            recognition.start();
            setDictationText("");
            setListening(true);
            setListeningKeyPress(true);
            let newDictationText = "";
            recognition.onresult = (e) => {
                newDictationText = "";
                for(let i=0;i<e.results.length;i++) {
                    newDictationText+=e.results[i][0].transcript;
                }
                setDictationText(newDictationText);
            }
            recognition.onspeechend = () => {
                setListening(false);
            }
            document.addEventListener('keyup', () => {
                if(e.key==="s") {
                    recognition.stop();
                    if(newDictationText) {
                        console.log("Sent message: "+newDictationText);
                        sendChatGPTMessage(newDictationText);
                    }
                    setListening(false);
                    setListeningKeyPress(false);
                }
            }, false);
        }
    });
    useEffect(() => {
        document.addEventListener('keydown', keyAssist, false);
        return () => {
            document.removeEventListener('keydown', keyAssist, false);
        }
    }, [keyAssist]);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(process.env.REACT_APP_PROXY+'/api/menu');
                if (response.ok) {
                    const data = await response.json();
                    setmenuItemApi(data);
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

    // Time and weather information area
    useEffect(() => {
        const minuteInterval = setInterval(() => {
            setTime((new Date()).toLocaleTimeString("en-US", {hour: "numeric", minute: "2-digit"}));
        }, 60000);
        let hourInterval = setInterval(() => {}, 360000);

        if(front) {
            async function fetchData() {
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
            fetchData();
            hourInterval = setInterval(() => fetchData(), 360000);
        }

        return () => {
            clearInterval(minuteInterval);
            clearInterval(hourInterval);
        };
    }, []);

    // Language information area
    // Ordered according to most spoken native languages at home in the United States in 2020
    const langInfo = {
        "en": "English",
        "es": "Español",
        "zh-CN": "中文",
        "vi": "Tiếng Việt",
        "ar": "اَلْعَرَبِيَّةُ",
        "fr": "Français",
        "ko": "한국어",
        "ru": "Русский",
        "pt": "Português",
        "de": "Deutsch",
        "pl": "Polski",
        "it": "Italiano",
        "ja": "日本語"
    }

    let langSelectList = [];
    for(const [key, val] of Object.entries(langInfo)) {
        if(key!==selectedLang) {
            langSelectList.push(
                <Dropdown.Item className="d-flex flex-row justify-content-between align-items-center gap-2 my-2" onClick={() => {
                    // Using cookies to programatically change language
                    setSelectedLang(key);
                    recognition.lang = key;
                    document.cookie = `googtrans=/en/${key}`;
                    window.location.reload();
                }}
                onFocus={() => {speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance(val))}}>
                    <div className="d-flex justify-content-center align-items-center text-lg w-100">{val}</div>
                </Dropdown.Item>
            );
        }
    }
    
    // College Station sales tax rate
    const SALES_TAX = 0.0825;

    // Cart information area area
    let price = 0;
    currentCart.forEach((cartItem) => price+=cartItem["price"]);
    let cartCardList = [];
    const navigate = useNavigate();

    if(currentCart!=null) {
        currentCart.forEach((cartItem, index) => {
            if(["Bowl", "Plate", "Bigger Plate"].indexOf(cartItem["name"])>=0) {
                cartCardList.push(
                    <div id={`cartItem${index}`} className="d-flex flex-row w-100 gap-4 pt-4 transition-all">
                        <img src={itemType[cartItem["name"]]["blob"]} alt={`${cartItem["name"]} in cart`} className="img-w-md object-fit-contain itemtype" />
                        <div className="d-flex flex-column w-100">
                            <div className="d-flex flex-row justify-content-between align-items-center text-lg gap-4">
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
                            <div className="d-flex flex-row justify-content-between align-items-center text-md gap-4">
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
        });
    }

    // Title information area
    let titleArea;
    if(front) {
        titleArea = <div className="d-flex flex-row align-items-center gap-4">
                        <div className="fw-bold text-invert text-xl">{time}</div>
                        <div className="d-flex flex-row align-items-center gap-2">
                            <img alt={weather.description} src={weather.icon} className="img-h-sm icon-shadow weather" />
                            <div className="d-flex flex-column">
                                <div className="text-invert text-lg">{weather.tempf}°F / {weather.tempc}°C <span className="fw-bold text-sm">{weather.description.split(' ').map((e) => e[0].toUpperCase()+e.substring(1)).join(' ')}</span></div>
                                <div className="text-invert text-secondary subtext">College Station</div>
                            </div>
                        </div>
                    </div>;
    }
    else {
        if(hasBackButton) {
            titleArea = <div className="d-flex flex-row align-items-center gap-4">
                            <Link to={hasCartButton ? -1 : "/consumer/itemtype"} className="text-invert link-no-underline" onFocus={() => {speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance('Back button'))}}>
                                <ArrowBackIcon sx={{ fontSize: 48 }} />
                            </Link>
                            <div className="fw-bold text-xl text-invert">{title}</div>
                        </div>;
        }
        else {
            titleArea = <div className="d-flex flex-row align-items-center gap-4">
                            <div className="fw-bold text-xl text-invert">{title}</div>
                        </div>;
        }
    }

    async function sendChatGPTMessage(message) {
        try {
            const response = await fetch(process.env.REACT_APP_PROXY+'/api/openai/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });
    
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
    
            const data = await response.json();
            console.log(data)
            let dbCode = data.response.split(',').map(Number);
            while(dbCode.length<5) {
                dbCode.push(0);
            }
            
            const findEntreeById = (uniqueid) => {
                const foundItem = menuItemApi.entree.find(item => item.uniqueid === uniqueid);
                if (!foundItem) {
                    throw new Error(`No entree found with uniqueid ${uniqueid}`);
                }
                return foundItem;
            };

            const findSideById = (uniqueid) => {
                const foundItem = menuItemApi.side.find(item => item.uniqueid === uniqueid);
                if (!foundItem) {
                    throw new Error(`No entree found with uniqueid ${uniqueid}`);
                }
                return foundItem;
            };

            const findAppetizerById = (uniqueid) => {
                const foundItem = menuItemApi.appetizer.find(item => item.uniqueid === uniqueid);
                if (!foundItem) {
                    throw new Error(`No entree found with uniqueid ${uniqueid}`);
                }
                return foundItem;
            };

            const findDrinkById = (uniqueid) => {
                const foundItem = menuItemApi.drink.find(item => item.uniqueid === uniqueid);
                if (!foundItem) {
                    throw new Error(`No entree found with uniqueid ${uniqueid}`);
                }
                return foundItem;
            };

            const uniqueidToTitle = {
                6: ["Bowl", 8.3],
                7: ["Plate", 9.8],
                8: ["Bigger Plate", 11.3],
                1: ["A La Carte", 5.20],
                9: ["Appetizers", 2.00],
                16: ["Drinks", 2.10]
            }
            
            let title = uniqueidToTitle[dbCode[0]][0];
            let price = uniqueidToTitle[dbCode[0]][1];
            
            let selectedSideItem = [findSideById(dbCode[1])];
            let selectedEntreeItem = [];

            if (title === "Bowl") { 
                selectedEntreeItem = [findEntreeById(dbCode[2])];
            }
            else if (title === "Plate") { 
                selectedEntreeItem = [findEntreeById(dbCode[2]), findEntreeById(dbCode[3])];
            }
            else if (title === "Bigger Plate") { 
                selectedEntreeItem = [findEntreeById(dbCode[2]), findEntreeById(dbCode[3]), findEntreeById(dbCode[4])];
            }

            for (let entree of selectedEntreeItem) { 
                if (entree.premium === true) { 
                    price += 1.5; 
                }
            }

            let newCart = [...currentCart];

            newCart.push({
                "name": title,
                "items": selectedSideItem.concat(selectedEntreeItem),
                "price": price,
                "type": "meal",
                "db_code": dbCode
            });

            localStorage.setItem("cart", JSON.stringify(newCart));
            setCurrentCart(newCart);
            window.location.reload();

            return data.response;
    
        } catch (error) {
            console.error('Error:', error);
        }
    }

    return (
        <div className={clsx(
            "d-flex flex-row justify-content-between px-5 py-4 w-100 z-3 sticky-top",
            !front && "card-shadow bg-panda-red"
        )}>
            {listening && (
                <div className="modal-overlay" onClick={() => {
                    recognition.stop();
                    setListening(false);
                }}>
                    <div className="modal-content d-flex flex-column justify-content-between w-50 min-h-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close px-4" onClick={() => {
                            recognition.stop();
                            setListening(false);
                        }}>
                            &times;
                        </button>
                        <h2 className="text-lg">Dictate Order</h2>
                        <div>{dictationText}</div>
                        {
                            listeningKeyPress ?
                            <div></div> :
                            <button className="add-to-order-btn text-md" onClick={() => {
                                recognition.stop();
                                console.log("Sent message: "+dictationText);
                                sendChatGPTMessage(dictationText);
                                setListening(false);
                            }}>Add To Order</button>
                        }
                    </div>
                </div>

            )}
            {titleArea}
            <div className="d-flex flex-row align-items-center gap-4">
                <button className={clsx(
                    "btn btn-primary align-items-center gap-2 ",
                    hasDictateButton ? "d-flex flex-row" : "d-none",
                )}
                onClick={() => {
                    recognition.start();
                    setDictationText("");
                    setListening(true);
                    let newDictationText = "";
                    recognition.onresult = (e) => {
                        newDictationText = "";
                        for(let i=0;i<e.results.length;i++) {
                            newDictationText+=e.results[i][0].transcript;
                        }
                        setDictationText(newDictationText);
                    }
                    recognition.onspeechend = () => {
                        setListening(false);
                    }
                }}
                onFocus={() => {speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance('Dictate order'))}}>
                    <MicIcon sx={{ fontSize: 48 }} />
                    <div className="d-flex flex-column align-items-start">
                        <div className="text-lg">Dictate Order</div>
                        <div className="text-secondary subtext text-sm">Speak Into Mic</div>
                    </div>
                </button>
                <button className={clsx(
                    "btn btn-primary align-items-center gap-2 ",
                    hasMagnifyButton ? "d-flex flex-row" : "d-none",
                )}
                onClick={() => {
                    if(!document.documentElement.style.getPropertyValue("--base-font-size")||document.documentElement.style.getPropertyValue("--base-font-size")==="0.8vw") document.documentElement.style.setProperty("--base-font-size", "1.2vw");
                    else document.documentElement.style.setProperty("--base-font-size", "0.8vw");
                }}
                onFocus={() => {speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance('Magnify'))}}>
                    <ZoomInIcon sx={{ fontSize: 48 }} />
                    <div className="d-flex flex-column align-items-start">
                        <div className="text-lg">Magnify</div>
                        <div className="text-secondary subtext text-sm">Increase Font Size</div>
                    </div>
                </button>
                <Dropdown>
                    <Dropdown.Toggle className={clsx(
                        "btn btn-primary align-items-center gap-3",
                        hasLanguageButton ? "d-flex flex-row" : "d-none",
                    )}
                    onFocus={() => {speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance('Change language'))}}>
                        <TranslateIcon sx={{ fontSize: 48 }} />
                        <div className="d-flex flex-row align-items-center gap-2">
                            <div className="d-flex flex-column align-items-start">
                                <div className="text-lg notranslate">{langInfo[selectedLang]}</div>
                                <div className="text-secondary subtext text-sm">Language</div>
                            </div>
                        </div>
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="min-w-100 p-0 notranslate max-vh-75 overflow-y-scroll">
                        {langSelectList}
                    </Dropdown.Menu>
                </Dropdown>
                <button className={clsx(
                    "btn btn-primary align-items-center gap-2 link-no-underline ",
                    hasCartButton ? "d-flex flex-row" : "d-none",
                )}
                onClick={() => setIsCartOpen(true)}
                onFocus={() => {speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance('View cart'))}}>
                    <ShoppingCartIcon sx={{ fontSize: 48 }} />
                    <div className="d-flex flex-column align-items-start">
                        <div className="text-lg" translate="no">{`$${price.toFixed(2)}`}</div>
                        <div className="text-secondary subtext text-sm">Cart</div>
                    </div>
                </button>
            </div>
            <div className={clsx("modal-overlay justify-content-end transition-all", isCartOpen ? "opacity-100" : "opacity-0 pe-none")} onClick={() => setIsCartOpen(false)}>
                <div className={clsx("modal-content cart h-100", !isCartOpen && "pe-none")} onClick={(e) => e.stopPropagation()}>
                    <div className="d-flex flex-column align-items-center h-100 atkinson">
                        <div className="d-flex flex-column justify-content-between align-items-center w-100 h-100 px-3 pb-3 overflow-hidden">
                            <div className="d-flex flex-column justify-content-start align-items-center w-100 pr-3 gap-4 divide-y overflow-y-scroll">
                                {cartCardList}
                            </div>
                            <div className="sidebar-total-container d-flex flex-column justify-content-end align-items-center w-100 pt-2 overflow-hidden">
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
                                    <button className="btn btn-secondary mt-4" onClick={() => navigate('/consumer/cart')} onFocus={() => {speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance('Go to checkout'))}}><strong className="text-lg">Checkout</strong></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConsumerTopbar;
