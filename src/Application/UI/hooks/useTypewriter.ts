import { useCallback, useEffect, useRef } from 'react';

type TypeTextOptions = {
    text: string;
    setText: (value: string) => void;
    getText?: () => string;
    isActive?: () => boolean;
    onDone?: () => void;
    minDelay?: number;
    randomDelay?: number;
};

export const sendAutoKey = (key = '') => {
    window.postMessage({ type: 'keydown', key: `_AUTO_${key}` }, '*');
};

export const useTypewriter = () => {
    const timersRef = useRef<number[]>([]);

    const setTimer = useCallback((callback: () => void, delay: number) => {
        const timer = window.setTimeout(callback, delay);
        timersRef.current.push(timer);
        return timer;
    }, []);

    const clearTimers = useCallback(() => {
        timersRef.current.forEach((timer) => window.clearTimeout(timer));
        timersRef.current = [];
    }, []);

    const typeText = useCallback(
        ({
            text,
            setText,
            getText,
            isActive = () => true,
            onDone,
            minDelay = 50,
            randomDelay = 50,
        }: TypeTextOptions) => {
            const tick = (index: number, currentText: string) => {
                const latestText = getText ? getText() : text;
                if (index >= latestText.length) {
                    onDone?.();
                    return;
                }

                setTimer(() => {
                    const nextText = getText ? getText() : text;
                    const nextCharacter = nextText[index];
                    if (typeof nextCharacter === 'undefined') {
                        onDone?.();
                        return;
                    }

                    if (isActive()) {
                        sendAutoKey(nextCharacter);
                    }

                    const typedText = currentText + nextCharacter;
                    setText(typedText);
                    tick(index + 1, typedText);
                }, Math.random() * randomDelay + minDelay);
            };

            tick(0, '');
        },
        [setTimer]
    );

    useEffect(() => clearTimers, [clearTimers]);

    return { typeText, setTimer, clearTimers };
};
