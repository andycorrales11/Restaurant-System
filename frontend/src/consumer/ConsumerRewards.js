import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

import Keyboard from "../Login/Keyboard";
import ConsumerTopbar from "../components/ConsumerTopbar";

import rewardsImage from "../resources/images/rewards.svg";
import rewardsBackground from "../resources/images/rewards_background.svg";

function ConsumerRewards() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isShift, setIsShift] = useState(false);
    const [rewardsData, setRewardsData] = useState(JSON.parse(window.localStorage.getItem("rewards")));

    const navigate = useNavigate();

    const handleKeyPress = (key) => {
        if (key === 'Backspace') {
            setEmail(email.slice(0, -1));
        } else if (key === 'Shift') {
            setIsShift(!isShift);
        } else {
            const char = isShift ? key.toUpperCase() : key.toLowerCase();
            setEmail(email + char);
        }
    };

    return (
        <div className="d-flex flex-column align-items-center atkinson vh-100">
            <ConsumerTopbar title="Rewards" />
            <div className="d-flex flex-column justify-content-center align-items-center w-100 h-100 gap-4">
                <div>
                    <div className={clsx("d-flex flex-column justify-content-center align-items-center transition-all", rewardsData ? "opacity-100" : "opacity-0 max-h-0")}>
                        <div className="text-md">Welcome</div>
                        <div className="text-md">{rewardsData ? rewardsData.email : ""}</div>
                        <div className="front-text text-panda-red nunito">{rewardsData ? rewardsData.points : 0}</div>
                        <div className="text-md">Points</div>
                    </div>
                    <img alt="Join Panda Rewards" src={rewardsImage} className={clsx("img-h-lg transition-all", rewardsData ? "opacity-0 max-h-0" : "opacity-100")} />
                </div>
                <input
                    type="text"
                    className="input-field"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {error && <div className="error-label">{error}</div>}
                <Keyboard onKeyPress={handleKeyPress} upperCase={isShift} />
            </div>
            <div className="position-absolute bottom-0 w-100">
                <img alt="Join Panda Rewards" src={rewardsBackground} className="position-relative w-100 z-n1" />
                <div className="d-flex flex-row justify-content-between align-items-center z-2 w-100 bg-white card-shadow">
                    <button className="btn btn-secondary w-100 h-100 rounded-0" onClick={async () => {
                        if(!email) {
                            setError('Enter an email address.');
                            speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance('Enter an email address.'));
                            return;
                        }
                        try {
                            const response = await fetch(process.env.REACT_APP_PROXY+`/api/rewards?email=${email}`);
                            if (response.ok) {
                                const data = await response.json();
                                window.localStorage.setItem("rewards", JSON.stringify(data));
                                setRewardsData(data);
                                setTimeout(() => navigate(-1), 2000);
                            }
                            else {
                                console.log("response not ok");
                                setError('An error occurred. Please try again.');
                                if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance('An error occurred. Please try again.'));
                            }
                        } catch (err) {
                            console.error('Rewards email error:', err);
                            setError('An error occurred. Please try again.');
                            speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance('An error occured. Please try again.'));
                        }
                    }}
                    onFocus={() => {speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance('Enter email'))}}>
                        <div className="text-lg py-4">Enter</div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConsumerRewards;