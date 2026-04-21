import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Easing } from '../Animation';

type IconToggleProps = {
    active: boolean;
    activeIcon: string;
    inactiveIcon: string;
    imageSize: number;
    imageDimension?: 'width' | 'height';
    onToggle: (active: boolean) => void;
    containerStyle?: React.CSSProperties;
};

const iconVars = {
    hovering: {
        opacity: 0.8,
        transition: {
            duration: 0.1,
            ease: Easing.expOut,
        },
    },
    active: {
        scale: 0.8,
        opacity: 0.5,
        transition: {
            duration: 0.1,
            ease: Easing.expOut,
        },
    },
    default: {
        scale: 1,
        opacity: 1,
        transition: {
            duration: 0.2,
            ease: Easing.expOut,
        },
    },
};

const IconToggle: React.FC<IconToggleProps> = ({
    active,
    activeIcon,
    inactiveIcon,
    imageSize,
    imageDimension = 'width',
    onToggle,
    containerStyle,
}) => {
    const [isHovering, setIsHovering] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const imageSizing =
        imageDimension === 'height'
            ? { height: imageSize }
            : { width: imageSize };

    return (
        <div
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={Object.assign({}, styles.container, containerStyle)}
            onMouseDown={(event) => {
                setIsPressed(true);
                event.preventDefault();
                onToggle(!active);
            }}
            onMouseUp={() => setIsPressed(false)}
            className="icon-control-container"
            id="prevent-click"
        >
            <motion.img
                id="prevent-click"
                src={active ? activeIcon : inactiveIcon}
                style={{
                    opacity: isPressed ? 0.2 : isHovering ? 0.8 : 1,
                    ...imageSizing,
                }}
                animate={
                    isPressed ? 'active' : isHovering ? 'hovering' : 'default'
                }
                variants={iconVars}
            />
        </div>
    );
};

const styles: StyleSheetCSS = {
    container: {
        background: 'black',
        textAlign: 'center',
        display: 'flex',
        boxSizing: 'border-box',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
    },
};

export default IconToggle;
