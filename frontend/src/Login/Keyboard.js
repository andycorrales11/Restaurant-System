import React from 'react';
import '../css/login.css';

const Keyboard = ({ onKeyPress, upperCase=false }) => {
    const rows = [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Backspace'],
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '@'],
    ];

    return (
        <div className="keyboard">
            {rows.map((row, rowIndex) => (
                <div className="keyboard-row" key={rowIndex}>
                    {row.map((key) => (
                        <button
                            key={key}
                            className={`keyboard-key ${
                                key === 'Backspace' || key === 'Shift' || key === '@' ? 'wide-key' : ''
                            }`}
                            onClick={() => onKeyPress(key)}
                            onFocus={() => {speechSynthesis.cancel(); if(window.localStorage.getItem('tts')==='true') speechSynthesis.speak(new SpeechSynthesisUtterance(key))}}
                        >
                            {key.length===1&&!upperCase ? key.toLowerCase() : key}
                        </button>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default Keyboard;
