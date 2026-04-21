import * as THREE from 'three';

export const MONITOR_SCREEN_SIZE = { w: 1280, h: 1024 };
export const MONITOR_IFRAME_PADDING = 32;
export const MONITOR_IFRAME_SIZE = {
    w: MONITOR_SCREEN_SIZE.w - MONITOR_IFRAME_PADDING,
    h: MONITOR_SCREEN_SIZE.h - MONITOR_IFRAME_PADDING,
};

export const MONITOR_POSITION = new THREE.Vector3(0, 950, 255);
export const MONITOR_ROTATION = new THREE.Euler(
    -3 * THREE.MathUtils.DEG2RAD,
    0,
    0
);

export const MONITOR_IFRAME_URLS = {
    production: 'https://innerportfolio.netlify.app/',
    development: 'http://localhost:3000/',
};

export const MONITOR_TEXTURE_LAYER_SCALE = 4;
export const MONITOR_DIM_FACTOR = 0.7;
export const MONITOR_ENCLOSING_COLOR = 0x48493f;
