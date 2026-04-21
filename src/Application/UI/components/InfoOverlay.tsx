import React, { useEffect, useRef, useState } from 'react';
import FreeCamToggle from './FreeCamToggle';
import MuteToggle from './MuteToggle';
import { sendAutoKey, useTypewriter } from '../hooks/useTypewriter';

interface InfoOverlayProps {
    visible: boolean;
}

const NAME_TEXT = 'Montassar Hajri';
const TITLE_TEXT = 'Software Engineer';

const InfoOverlay: React.FC<InfoOverlayProps> = ({ visible }) => {
    const visRef = useRef(visible);
    const [nameText, setNameText] = useState('');
    const [titleText, setTitleText] = useState('');
    const [time, setTime] = useState(new Date().toLocaleTimeString());
    const timeRef = useRef(time);
    const [timeText, setTimeText] = useState('');
    const [textDone, setTextDone] = useState(false);
    const [volumeVisible, setVolumeVisible] = useState(false);
    const [freeCamVisible, setFreeCamVisible] = useState(false);
    const { typeText, setTimer } = useTypewriter();

    useEffect(() => {
        if (visible && nameText === '') {
            setTimer(() => {
                typeText({
                    text: NAME_TEXT,
                    setText: setNameText,
                    isActive: () => visRef.current,
                    onDone: () => {
                        typeText({
                            text: TITLE_TEXT,
                            setText: setTitleText,
                            isActive: () => visRef.current,
                            onDone: () => {
                                typeText({
                                    text: timeRef.current,
                                    getText: () => timeRef.current,
                                    setText: setTimeText,
                                    isActive: () => visRef.current,
                                    onDone: () => setTextDone(true),
                                });
                            },
                        });
                    },
                });
            }, 400);
        }

        visRef.current = visible;
    }, [nameText, setTimer, typeText, visible]);

    useEffect(() => {
        if (!textDone) return;

        let freeCamTimer: ReturnType<typeof setTimeout> | undefined;
        const volumeTimer = setTimeout(() => {
            setVolumeVisible(true);
            freeCamTimer = setTimeout(() => {
                setFreeCamVisible(true);
            }, 250);
        }, 250);

        return () => {
            clearTimeout(volumeTimer);
            if (freeCamTimer) clearTimeout(freeCamTimer);
        };
    }, [textDone]);

    useEffect(() => {
        sendAutoKey();
    }, [freeCamVisible, volumeVisible]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        timeRef.current = time;
        if (textDone) {
            setTimeText(time);
        }
    }, [textDone, time]);

    return (
        <div style={styles.wrapper}>
            {nameText !== '' && (
                <div style={styles.container}>
                    <p>{nameText}</p>
                </div>
            )}
            {titleText !== '' && (
                <div style={styles.container}>
                    <p>{titleText}</p>
                </div>
            )}
            {timeText !== '' && (
                <div style={styles.lastRow}>
                    <div
                        style={Object.assign(
                            {},
                            styles.container,
                            styles.lastRowChild
                        )}
                    >
                        <p>{timeText}</p>
                    </div>
                    {volumeVisible && (
                        <div style={styles.lastRowChild}>
                            <MuteToggle />
                        </div>
                    )}
                    {freeCamVisible && (
                        <div style={styles.lastRowChild}>
                            <FreeCamToggle />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const styles: StyleSheetCSS = {
    container: {
        background: 'black',
        padding: 4,
        paddingLeft: 16,
        paddingRight: 16,
        textAlign: 'center',
        display: 'flex',
        marginBottom: 4,
        boxSizing: 'border-box',
    },
    wrapper: {
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    lastRow: {
        display: 'flex',
        flexDirection: 'row',
    },
    lastRowChild: {
        marginRight: 4,
    },
};

export default InfoOverlay;
