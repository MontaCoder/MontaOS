import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import UIEventBus from '../EventBus';
import InfoOverlay from './InfoOverlay';
import { Easing } from '../Animation';

interface InterfaceUIProps {}

const InterfaceUI: React.FC<InterfaceUIProps> = ({}) => {
    const [initLoad, setInitLoad] = useState(true);
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const interfaceRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const unsubscribeLoading = UIEventBus.on('loadingScreenDone', () => {
            setLoading(false);
        });

        const element = document.getElementById('ui-interactive');
        if (element) {
            interfaceRef.current = element;
        }

        return unsubscribeLoading;
    }, []);

    const initMouseDownHandler = useCallback(() => {
        setVisible(true);
        setInitLoad(false);
    }, []);

    useEffect(() => {
        if (!loading && initLoad) {
            document.addEventListener('mousedown', initMouseDownHandler);
            return () => {
                document.removeEventListener('mousedown', initMouseDownHandler);
            };
        }
    }, [initLoad, initMouseDownHandler, loading]);

    useEffect(() => {
        const unsubscribeEnterMonitor = UIEventBus.on('enterMonitor', () => {
            setVisible(false);
            setInitLoad(false);
            if (interfaceRef.current) {
                interfaceRef.current.style.pointerEvents = 'none';
            }
        });
        const unsubscribeLeftMonitor = UIEventBus.on('leftMonitor', () => {
            setVisible(true);
            if (interfaceRef.current) {
                interfaceRef.current.style.pointerEvents = 'auto';
            }
        });

        return () => {
            unsubscribeEnterMonitor();
            unsubscribeLeftMonitor();
        };
    }, []);

    return !loading ? (
        <motion.div
            initial="hide"
            variants={vars}
            animate={visible ? 'visible' : 'hide'}
            style={styles.wrapper}
            className="interface-wrapper"
            id="prevent-click"
        >
            <InfoOverlay visible={visible} />
        </motion.div>
    ) : (
        <></>
    );
};

const vars = {
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.5,
            delay: 0.3,
            ease: Easing.expOut,
        },
    },
    hide: {
        x: -32,
        opacity: 0,
        transition: {
            duration: 0.3,
            ease: Easing.expOut,
        },
    },
};

interface StyleSheetCSS {
    [key: string]: React.CSSProperties;
}

const styles: StyleSheetCSS = {
    wrapper: {
        width: '100%',
        display: 'flex',
        position: 'absolute',
        boxSizing: 'border-box',
    },
};

export default InterfaceUI;
