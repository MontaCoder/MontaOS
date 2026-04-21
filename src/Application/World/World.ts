import * as THREE from 'three';
import Application from '../Application';
import Resources from '../Utils/Resources';
import MonitorScreen from './MonitorScreen';
import CoffeeSteam from './CoffeeSteam';
import AudioManager from '../Audio/AudioManager';
import BakedSceneObject from './BakedSceneObject';

const BAKED_SCENE_OBJECTS = [
    {
        model: 'environmentModel',
        texture: 'environmentTexture',
        scale: 900,
    },
    {
        model: 'decorModel',
        texture: 'decorTexture',
        scale: 900,
    },
    {
        model: 'computerSetupModel',
        texture: 'computerSetupTexture',
        scale: 900,
    },
];

export default class World {
    application: Application;
    scene: THREE.Scene;
    resources: Resources;

    // Objects in the scene
    bakedObjects: BakedSceneObject[];
    monitorScreen: MonitorScreen;
    coffeeSteam: CoffeeSteam;
    audioManager: AudioManager;

    constructor() {
        this.application = Application.getInstance();
        this.scene = this.application.scene;
        this.resources = this.application.resources;
        this.bakedObjects = [];
        // Wait for resources
        this.resources.on('ready', () => {
            // Setup
            this.bakedObjects = BAKED_SCENE_OBJECTS.map(
                (options) => new BakedSceneObject(options)
            );
            this.monitorScreen = new MonitorScreen();
            this.coffeeSteam = new CoffeeSteam();
            this.audioManager = new AudioManager();
        });
    }

    update() {
        if (this.monitorScreen) this.monitorScreen.update();
        this.bakedObjects.forEach((object) => object.update());
        if (this.coffeeSteam) this.coffeeSteam.update();
        if (this.audioManager) this.audioManager.update();
    }

    destroy() {
        this.monitorScreen?.destroy();
        this.audioManager?.destroy();
        this.resources.off('ready');
    }
}
