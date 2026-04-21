import * as THREE from 'three';
import Application from '../Application';
import EventEmitter from './EventEmitter';
import Resources from './Resources';
import UIEventBus from '../UI/EventBus';

export default class Loading extends EventEmitter {
    progress: number;
    application: Application;
    resources: Resources;
    scene: THREE.Scene;

    constructor() {
        super();

        this.application = Application.getInstance();
        this.resources = this.application.resources;

        this.scene = this.application.scene;
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
