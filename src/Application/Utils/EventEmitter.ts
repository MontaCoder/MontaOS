type EventCallback = (...args: unknown[]) => unknown;

export default class EventEmitter {
    private callbacks = new Map<string, Set<EventCallback>>();

    on(name: string, callback: EventCallback) {
        if (!name || !callback) {
            console.warn('wrong event subscription');
            return false;
        }

        const listeners = this.callbacks.get(name) ?? new Set<EventCallback>();
        listeners.add(callback);
        this.callbacks.set(name, listeners);

        return this;
    }

    off(name: string) {
        if (!name) {
            console.warn('wrong event name');
            return false;
        }

        this.callbacks.delete(name);
        return this;
    }

    trigger(name: string, args: unknown[] = []) {
        if (!name) {
            console.warn('wrong event name');
            return false;
        }

        let firstResult: unknown;
        const listeners = this.callbacks.get(name);
        listeners?.forEach((callback) => {
            const result = callback(...args);
            if (typeof firstResult === 'undefined') {
                firstResult = result;
            }
        });

        return firstResult;
    }

    destroy() {
        this.callbacks.clear();
    }
}
