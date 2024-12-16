import React from "react";
import { Link } from "react-router-dom";

function ItemTypeCard({ title, img, desc, cal, minPrice }) {
    return (
        <Link to={title.replaceAll(" ", "").toLowerCase()} className="btn-card d-flex flex-column w-100 h-100 link-no-underline" onFocus={() => {speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance(`${title}, ${desc}, $${minPrice} or more`))}}>
            <div className="text-xl">{title}</div>
            <img alt={`Select ${title} item type`} src={img} className="img-h-lg object-fit-contain itemtype" />
            <div className="d-flex flex-row justify-content-between">
                <div>{desc}</div>
                <div className="text-end">{`${cal} Cal per serving`}</div>
            </div>
            <strong className="d-flex flex-row justify-content-center text-lg" translate="no">{`$${minPrice.toFixed(2)}+`}</strong>
        </Link>
    );
}

export default ItemTypeCard;