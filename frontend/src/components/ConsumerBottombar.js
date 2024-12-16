import React from "react";
import { useNavigate } from "react-router-dom";

function ConsumerBottombar() {
    const navigate = useNavigate();

    return (
        <div className="d-flex flex-row justify-content-between align-items-center position-fixed bottom-0 z-2 w-100 bg-white card-shadow">
            <button className="btn btn-secondary w-50 rounded-0" onClick={() => navigate('/consumer')} onFocus={() => {speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance('Restart order'))}}>
                <div className="text-lg py-4">Restart Order</div>
            </button>
            <button className="btn btn-secondary w-100 rounded-0 bg-danger" onClick={() => navigate('/consumer/rewards')} onFocus={() => {speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance('Rewards'))}}>
                <div className="text-lg py-4">Rewards</div>
            </button>
            <button className="btn btn-secondary w-100 rounded-0" onClick={() => navigate('/consumer/cart')} onFocus={() => {speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance('Go to checkout'))}}>
                <div className="text-lg py-4">Checkout</div>
            </button>
        </div>
    );
}

export default ConsumerBottombar;