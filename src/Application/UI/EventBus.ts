const UIEventBus = {
    on<K extends UIEventName>(
        event: K,
        callback: (data: UIEventMap[K]) => void
    ): EventUnsubscribe {
        const listener = (e: Event) => {
            callback((e as CustomEvent<UIEventMap[K]>).detail);
        };

        document.addEventListener(event, listener);

        return () => {
            document.removeEventListener(event, listener);
        };
    },
    dispatch<K extends UIEventName>(event: K, data: UIEventMap[K]) {
        document.dispatchEvent(new CustomEvent(event, { detail: data }));
    },
    remove<K extends UIEventName>(event: K, callback: EventListener) {
        document.removeEventListener(event, callback);
    },
};

export default UIEventBus;
