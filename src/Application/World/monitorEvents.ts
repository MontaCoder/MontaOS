import { MONITOR_IFRAME_SIZE } from './monitorConfig';

const FORWARDED_MESSAGE_TYPES = new Set([
    'mousemove',
    'mousedown',
    'mouseup',
    'keydown',
    'keyup',
]);

export type MonitorMessage = {
    type?: string;
    clientX?: number;
    clientY?: number;
    key?: string;
};

export const isAllowedMonitorMessage = (
    event: MessageEvent<MonitorMessage>,
    iframe: HTMLIFrameElement
) => {
    const data = event.data;
    if (!data?.type || !FORWARDED_MESSAGE_TYPES.has(data.type)) {
        return false;
    }

    if (event.source === window) return true;
    if (event.source !== iframe.contentWindow) return false;

    try {
        return event.origin === new URL(iframe.src).origin;
    } catch {
        return false;
    }
};

export const createForwardedMonitorEvent = (
    data: MonitorMessage,
    iframe: HTMLIFrameElement
) => {
    const event = new CustomEvent(data.type || '', {
        bubbles: true,
        cancelable: false,
    }) as ComputerEvent;

    event.inComputer = true;

    if (data.type === 'mousemove') {
        const { top, left, width, height } = iframe.getBoundingClientRect();
        const widthRatio = width / MONITOR_IFRAME_SIZE.w;
        const heightRatio = height / MONITOR_IFRAME_SIZE.h;

        event.clientX = Math.round((data.clientX || 0) * widthRatio + left);
        event.clientY = Math.round((data.clientY || 0) * heightRatio + top);
    } else if (data.type === 'keydown' || data.type === 'keyup') {
        event.key = data.key;
    }

    return event;
};
