import React, { useCallback, useEffect, useState } from 'react';
import eventBus from '../EventBus';
import { detectWebGLContext, getResourceSpacing } from '../bios';
import BiosLoadingText from './loading/BiosLoadingText';
import {
    FirefoxErrorPrompt,
    LoadingStartPrompt,
    WebGLErrorPrompt,
} from './loading/LoadingPrompts';
import styles from '../loadingStyles';

type LoadingProps = {};

const LoadingScreen: React.FC<LoadingProps> = () => {
    const [progress, setProgress] = useState(0);
    const [toLoad, setToLoad] = useState(0);
    const [loaded, setLoaded] = useState(0);
    const [overlayOpacity, setLoadingOverlayOpacity] = useState(1);
    const [loadingTextOpacity, setLoadingTextOpacity] = useState(1);
    const [startPopupOpacity, setStartPopupOpacity] = useState(0);
    const [firefoxPopupOpacity, setFirefoxPopupOpacity] = useState(0);
    const [webGLErrorOpacity, setWebGLErrorOpacity] = useState(0);

    const [showBiosInfo, setShowBiosInfo] = useState(false);
    const [showLoadingResources, setShowLoadingResources] = useState(false);
    const [doneLoading, setDoneLoading] = useState(false);
    const [firefoxError, setFirefoxError] = useState(false);
    const [webGLError, setWebGLError] = useState(false);
    const [resources, setResources] = useState<string[]>([]);
    const [mobileWarning, setMobileWarning] = useState(window.innerWidth < 768);

    useEffect(() => {
        const onResize = () => {
            setMobileWarning(window.innerWidth < 768);
        };

        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize);
        };
    }, []);

    const start = useCallback(() => {
        setLoadingOverlayOpacity(0);
        eventBus.dispatch('loadingScreenDone', {});
        const ui = document.getElementById('ui');
        if (ui) {
            ui.style.pointerEvents = 'none';
        }
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('debug')) {
            start();
        }

        if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
            setFirefoxError(true);
        } else if (!detectWebGLContext()) {
            setWebGLError(true);
        } else {
            setShowBiosInfo(true);
        }
    }, [start]);

    useEffect(() => {
        return eventBus.on('loadedSource', (data) => {
            setProgress(data.progress);
            setToLoad(data.toLoad);
            setLoaded(data.loaded);
            setResources((currentResources) => {
                const nextResource = `Loaded ${
                    data.sourceName
                }${getResourceSpacing(data.sourceName)} ... ${Math.round(
                    data.progress * 100
                )}%`;

                return [...currentResources, nextResource].slice(-8);
            });
        });
    }, []);

    useEffect(() => {
        setShowLoadingResources(true);
    }, [loaded]);

    useEffect(() => {
        if (progress >= 1 && !firefoxError && !webGLError) {
            setDoneLoading(true);

            let startPopupTimer: ReturnType<typeof setTimeout> | undefined;
            const loadingTextTimer = setTimeout(() => {
                setLoadingTextOpacity(0);
                startPopupTimer = setTimeout(() => {
                    setStartPopupOpacity(1);
                }, 500);
            }, 1000);

            return () => {
                clearTimeout(loadingTextTimer);
                if (startPopupTimer) clearTimeout(startPopupTimer);
            };
        }
    }, [firefoxError, progress, webGLError]);

    useEffect(() => {
        if (!firefoxError) return;

        const timer = setTimeout(() => {
            setFirefoxPopupOpacity(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [firefoxError]);

    useEffect(() => {
        if (!webGLError) return;

        const timer = setTimeout(() => {
            setWebGLErrorOpacity(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [webGLError]);

    return (
        <div
            style={Object.assign({}, styles.overlay, {
                opacity: overlayOpacity,
                transform: `scale(${overlayOpacity === 0 ? 1.1 : 1})`,
            })}
        >
            {startPopupOpacity === 0 && loadingTextOpacity === 0 && (
                <div style={styles.blinkingContainer}>
                    <span className="blinking-cursor" />
                </div>
            )}
            {!firefoxError && !webGLError && (
                <BiosLoadingText
                    opacity={loadingTextOpacity}
                    showBiosInfo={showBiosInfo}
                    showLoadingResources={showLoadingResources}
                    doneLoading={doneLoading}
                    progress={progress}
                    loaded={loaded}
                    toLoad={toLoad}
                    resources={resources}
                />
            )}
            <LoadingStartPrompt
                opacity={startPopupOpacity}
                mobileWarning={mobileWarning}
                onStart={start}
            />
            {firefoxError && (
                <FirefoxErrorPrompt opacity={firefoxPopupOpacity} />
            )}
            {webGLError && <WebGLErrorPrompt opacity={webGLErrorOpacity} />}
        </div>
    );
};

export default LoadingScreen;
