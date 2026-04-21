import React, { useEffect, useState } from 'react';
import UIEventBus from '../EventBus';
import volumeOn from '../../../../static/textures/UI/volume_on.svg';
import volumeOff from '../../../../static/textures/UI/volume_off.svg';
import IconToggle from './IconToggle';

interface MuteToggleProps {}

const MuteToggle: React.FC<MuteToggleProps> = ({}) => {
    const [muted, setMuted] = useState(false);

    useEffect(() => {
        UIEventBus.dispatch('muteToggle', muted);
    }, [muted]);

    return (
        <IconToggle
            active={muted}
            activeIcon={volumeOff}
            inactiveIcon={volumeOn}
            imageSize={window.innerWidth < 768 ? 8 : 10}
            onToggle={setMuted}
        />
    );
};

export default MuteToggle;
