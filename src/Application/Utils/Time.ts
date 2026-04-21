import UIEventBus from '../UI/EventBus';
import EventEmitter from './EventEmitter';

export default class Time extends EventEmitter {
    start: number;
    current: number;
    elapsed: number;
    delta: number;
    private frameId: number | undefined;
    private running: boolean;
    private unsubscribeLoadingDone: EventUnsubscribe;

    constructor() {
        super();

        // Setup
        this.start = Date.now();
        this.current = this.start;
        this.elapsed = 0;
        this.delta = 16;
        this.running = true;

        this.frameId = window.requestAnimationFrame(() => {
            this.tick();
        });

        this.unsubscribeLoadingDone = UIEventBus.on('loadingScreenDone', () => {
            this.start = Date.now();
        });
    }

    tick() {
        if (!this.running) return;

        const currentTime = Date.now();
        this.delta = currentTime - this.current;
        this.current = currentTime;
        this.elapsed = this.current - this.start;

        this.trigger('tick');

        this.frameId = window.requestAnimationFrame(() => {
            this.tick();
        });
    }

    destroy() {
        this.running = false;
        if (this.frameId) {
            window.cancelAnimationFrame(this.frameId);
        }
        this.unsubscribeLoadingDone();
        super.destroy();
    }
}
