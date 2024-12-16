import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import clsx from "clsx";

import ConsumerTopbar from "../components/ConsumerTopbar";

import promotionImage from "../resources/menu_item/hot_ones_blazing_bourbon_chicken.png";
import promotionLabel from "../resources/images/promotion_label.png";
import wokBackground from "../resources/images/wok_grey_background.png";
import weWokForYou from "../resources/images/wok_pan_background_desktop.png";
import foodVideo from "../resources/videos/food_background.mp4";

function ConsumerFront() {
    const [showStaticBg, setShowStaticBg] = useState(true);

    // Reset cart, language, rewards, TTS
    localStorage.removeItem('cart');
    localStorage.removeItem('rewards');
    localStorage.removeItem('tts');
    if(document.cookie.split("; ").filter((e) => e.includes("googtrans")).length!==0&&document.cookie.split("; ").filter((e) => e.includes("googtrans"))[0].split("/")[2]!=='en') {
        document.cookie = `googtrans=/en/en`;
        window.location.reload();
    }

    // Changing between showing video and image
    useEffect(() => {
        const minuteInterval = setInterval(() => {
            setShowStaticBg(!showStaticBg);
        }, 60000);
        return () => clearInterval(minuteInterval);
    }, []);

    // Use esc key to exit consumer screen
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

    return (
        <div className="atkinson bg-black">
            {showStaticBg ?
            <div>
                <img src={wokBackground} alt="background" className="position-absolute vw-100 vh-100 start-0 z-0" />
                <div className="d-flex position-absolute vw-100 vh-100 justify-content-center z-0">
                    <img src={weWokForYou} alt="background" className="vw-100 start-0 object-fit-cover" />
                </div>
            </div> :
            <video autoplay="autoplay" loop="loop" muted="muted" playsinline="" className="position-absolute vw-100 vh-100 start-0 z-0 object-fit-cover">
                <source src={foodVideo} type="video/mp4"></source>
            </video>}
            <div className="d-flex flex-column vh-100 vw-100">
                <ConsumerTopbar front={true} hasDictateButton={false} hasCartButton={false} />
                <Link to={"itemtype"} className="d-flex flex-column justify-content-center align-items-center px-5 py-4 flex-grow-1 link-no-underline z-1">
                    <h1 className="text-invert front-text fw-bold text-shadow">ORDER HERE</h1>
                    <h2 className="text-invert text-xl text-shadow">Tap anywhere to start</h2>
                    <div className="d-flex flex-row">
                        <img src={promotionImage} alt="Try our new Hot Ones Blazing Bourbon Chicken." className={clsx("img-w-rl object-fit-cover transition-all", !showStaticBg && "opacity-0")} />
                        <img src={promotionLabel} alt="Try our new Hot Ones Blazing Bourbon Chicken." className={clsx("img-w-rl object-fit-contain transition-all", !showStaticBg && "opacity-0")} />
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default ConsumerFront;