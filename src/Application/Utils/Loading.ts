import EventEmitter from './EventEmitter';
import UIEventBus from '../UI/EventBus';

export default class Loading extends EventEmitter {
    progress: number;

    constructor() {
        super();

        this.on('loadedSource', (sourceName, loaded, toLoad) => {
            const loadedCount = Number(loaded);
            const totalToLoad = Number(toLoad);
            const resourceName = String(sourceName);
            this.progress = loadedCount / totalToLoad;
            UIEventBus.dispatch('loadedSource', {
                sourceName: resourceName,
                progress: loadedCount / totalToLoad,
                toLoad: totalToLoad,
                loaded: loadedCount,
            });
        });
    }
}
