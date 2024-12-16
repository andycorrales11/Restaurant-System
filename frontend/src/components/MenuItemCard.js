import React from "react";
import clsx from "clsx";

import "./../css/consumer.css";

function MenuItemCard({ qb, title, img, premium=false, className, onClick }) {

    return (
        <button className={clsx("btn-card d-flex flex-column w-100 h-100", className)} onClick={onClick} onFocus={() => {speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance(title))}}>
            <div className="d-flex flex-row justify-content-between align-items-end gap-4">
                <div className="text-lg text-start">{title}</div>
            </div>
            <div className="d-flex flex-column justify-content-end h-100">
                <div className="position-relative">
                    <img alt={`Select ${title} item type`} src={img} className="w-100 object-fit-contain" />
                    <div className={clsx(
                        "premium-pill text-sm position-absolute bottom-0 right-0",
                        !premium && "opacity-0"
                    )}>Premium</div>
                </div>
                <div className="d-flex flex-row justify-content-between align-items-center mt-2">
                    <div>
                        {qb}
                    </div>
                    <div className="opacity-0 p-2">|</div>
                </div>
            </div>
        </button>
    );
}

export default MenuItemCard;