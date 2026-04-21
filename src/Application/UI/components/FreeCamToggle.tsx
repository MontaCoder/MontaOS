import React, { useEffect, useState } from 'react';
import UIEventBus from '../EventBus';
import camera from '../../../../static/textures/UI/camera.svg';
import mouse from '../../../../static/textures/UI/mouse.svg';
import IconToggle from './IconToggle';
import { sendAutoKey } from '../hooks/useTypewriter';

interface FreeCamToggleProps {}

const FreeCamToggle: React.FC<FreeCamToggleProps> = ({}) => {
    const [freeCamActive, setFreeCamActive] = useState(false);
    const [blockEvents, setBlockEvents] = useState(true);

    const iconSize = freeCamActive
        ? window.innerWidth < 768
            ? 8
            : 10
        : window.innerWidth < 768
        ? 4
        : 6;

    useEffect(() => {
        const timer = setTimeout(() => {
            setBlockEvents(false);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!blockEvents) {
            sendAutoKey();
            UIEventBus.dispatch('freeCamToggle', freeCamActive);
        }
    }, [blockEvents, freeCamActive]);

    return (
        <div style={styles.wrapper}>
            <IconToggle
                active={freeCamActive}
                activeIcon={mouse}
                inactiveIcon={camera}
                imageSize={iconSize}
                imageDimension="height"
                onToggle={setFreeCamActive}
                containerStyle={styles.container}
            />
        </div>
    );
};

const styles: StyleSheetCSS = {
    container: {
        paddingLeft: 8,
        paddingRight: 8,
    },
    wrapper: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
    },
};

export default FreeCamToggle;
