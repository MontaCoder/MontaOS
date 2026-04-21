import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import LoadingScreen from './components/LoadingScreen';
import HelpPrompt from './components/HelpPrompt';
import InterfaceUI from './components/InterfaceUI';
import eventBus from './EventBus';
import './style.css';

const App = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        return eventBus.on('loadingScreenDone', () => {
            setLoading(false);
        });
    }, []);

    return (
        <div id="ui-app">
            {!loading && <HelpPrompt />}
            <LoadingScreen />
        </div>
    );
};

type Root = ReturnType<typeof createRoot>;

let uiRoot: Root | null = null;
let volumeRoot: Root | null = null;

const createUI = () => {
    const element = document.getElementById('ui');
    if (!element) return;

    if (!uiRoot) {
        uiRoot = createRoot(element);
    }

    uiRoot.render(<App />);
};

const createVolumeUI = () => {
    const element = document.getElementById('ui-interactive');
    if (!element) return;

    if (!volumeRoot) {
        volumeRoot = createRoot(element);
    }

    volumeRoot.render(<InterfaceUI />);
};

export { createUI, createVolumeUI };
