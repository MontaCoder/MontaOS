import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import UIEventBus from '../EventBus';
import { Easing } from '../Animation';
import { sendAutoKey, useTypewriter } from '../hooks/useTypewriter';

const HELP_TEXT = 'Click anywhere to begin';

type HelpPromptProps = {};

const HelpPrompt: React.FC<HelpPromptProps> = () => {
    const [helpText, setHelpText] = useState('');
    const [visible, setVisible] = useState(true);
    const visRef = useRef(visible);
    const { typeText, setTimer } = useTypewriter();

    useEffect(() => {
        setTimer(() => {
            typeText({
                text: HELP_TEXT,
                setText: setHelpText,
                isActive: () => visRef.current,
                minDelay: 50,
                randomDelay: 120,
            });
        }, 500);

        const hidePrompt = () => {
            setVisible(false);
        };

        document.addEventListener('mousedown', hidePrompt);
        const unsubscribeMonitor = UIEventBus.on('enterMonitor', () => {
            setVisible(false);
        });

        return () => {
            document.removeEventListener('mousedown', hidePrompt);
            unsubscribeMonitor();
        };
    }, [setTimer, typeText]);

    useEffect(() => {
        if (!visible) {
            sendAutoKey();
        }
        visRef.current = visible;
    }, [visible]);

    return helpText.length > 0 ? (
        <motion.div
            variants={vars}
            animate={visible ? 'visible' : 'hide'}
            style={styles.container}
        >
            <p>{helpText}</p>
            <div style={styles.blinkingContainer}>
                <div className="blinking-cursor" />
            </div>
        </motion.div>
    ) : (
        <></>
    );
};

const vars = {
    visible: {
        opacity: 1,
    },
    hide: {
        y: 12,
        opacity: 0,
        transition: {
            duration: 0.5,
            ease: Easing.expOut,
        },
    },
};

const styles: StyleSheetCSS = {
    container: {
        position: 'absolute',
        bottom: 64,
        background: 'black',
        padding: 4,
        paddingLeft: 16,
        paddingRight: 16,
        textAlign: 'center',
        display: 'flex',
        alignItems: 'flex-end',
    },
    blinkingContainer: {
        marginLeft: 8,
        paddingBottom: 2,
        paddingRight: 4,
    },
};

export default HelpPrompt;
