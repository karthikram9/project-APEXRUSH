import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { STYLES } from '../utils/styles';

const VoiceInput = ({ label, name, value, onChange, placeholder, type = "text" }) => {
    const [isListening, setIsListening] = useState(false);

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Web Speech API is not supported in this browser. Please use Chrome or Edge.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.trim();
            // Try to extract numbers from the transcript if type is number
            let finalValue = transcript;
            if (type === 'number') {
                const match = transcript.match(/[\d.]+/);
                if (match) finalValue = match[0];
            }

            onChange({ target: { name, value: type === 'number' ? Number(finalValue) : finalValue } });
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    return (
        <div className="relative">
            <label className={STYLES.label}>{label}</label>
            <div className="relative flex items-center">
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`${STYLES.input} pr-12`}
                    step="any" // Allow decimals if it's a number
                />
                <button
                    type="button"
                    onClick={startListening}
                    className={`${STYLES.buttonContainer} ${isListening ? 'text-red-400 animate-pulse' : ''}`}
                    title="Click to dictate"
                >
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
            </div>
        </div>
    );
};

export default VoiceInput;
