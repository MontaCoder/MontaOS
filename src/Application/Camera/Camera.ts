import * as THREE from 'three';
import Application from '../Application';
import Sizes from '../Utils/Sizes';
import EventEmitter from '../Utils/EventEmitter';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import TWEEN from '@tweenjs/tween.js';
import Renderer from '../Renderer';
import Resources from '../Utils/Resources';
import UIEventBus from '../UI/EventBus';
import Time from '../Utils/Time';
import BezierEasing from 'bezier-easing';
import { CameraKey } from './cameraConfig';
import {
    CameraKeyframeInstance,
    MonitorKeyframe,
    IdleKeyframe,
    LoadingKeyframe,
    DeskKeyframe,
    OrbitControlsStart,
} from './CameraKeyframes';

export default class Camera extends EventEmitter {
    application: Application;
    sizes: Sizes;
    scene: THREE.Scene;
    instance: THREE.PerspectiveCamera;
    renderer: Renderer;
    resources: Resources;
    time: Time;

    position: THREE.Vector3;
    focalPoint: THREE.Vector3;

    freeCam: boolean;
    orbitControls: OrbitControls;

    currentKeyframe: CameraKey | undefined;
    targetKeyframe: CameraKey | undefined;
    keyframes: { [key in CameraKey]: CameraKeyframeInstance };
    private activeTweens: { stop: () => void }[];
    private unsubscribeListeners: EventUnsubscribe[];
    private documentMouseDownHandler: (event: MouseEvent) => void;

    constructor() {
        super();
        this.application = Application.getInstance();
        this.sizes = this.application.sizes;
        this.scene = this.application.scene;
        this.renderer = this.application.renderer;
        this.resources = this.application.resources;
        this.time = this.application.time;

        this.position = new THREE.Vector3(0, 0, 0);
        this.focalPoint = new THREE.Vector3(0, 0, 0);

        this.freeCam = false;
        this.activeTweens = [];
        this.unsubscribeListeners = [];

        this.keyframes = {
            [CameraKey.IDLE]: new IdleKeyframe(),
            [CameraKey.MONITOR]: new MonitorKeyframe(),
            [CameraKey.LOADING]: new LoadingKeyframe(),
            [CameraKey.DESK]: new DeskKeyframe(),
            [CameraKey.ORBIT_CONTROLS_START]: new OrbitControlsStart(),
        };

        this.documentMouseDownHandler = (event) => {
            event.preventDefault();
            if ((event.target as HTMLElement | null)?.id === 'prevent-click') {
                return;
            }
            if (
                this.currentKeyframe === CameraKey.IDLE ||
                this.targetKeyframe === CameraKey.IDLE
            ) {
                this.transition(CameraKey.DESK);
            } else if (
                this.currentKeyframe === CameraKey.DESK ||
                this.targetKeyframe === CameraKey.DESK
            ) {
                this.transition(CameraKey.IDLE);
            }
        };

        document.addEventListener('mousedown', this.documentMouseDownHandler);

        this.setPostLoadTransition();
        this.setInstance();
        this.setMonitorListeners();
        this.setFreeCamListeners();
    }

    transition(
        key: CameraKey,
        duration: number = 1000,
        easing?: (amount: number) => number,
        callback?: () => void
    ) {
        if (this.currentKeyframe === key) return;

        if (this.targetKeyframe) {
            this.activeTweens.forEach((tween) => tween.stop());
            this.activeTweens = [];
        }

        this.currentKeyframe = undefined;
        this.targetKeyframe = key;

        const keyframe = this.keyframes[key];

        const posTween = new TWEEN.Tween(this.position)
            .to(keyframe.position, duration)
            .easing(easing || TWEEN.Easing.Quintic.InOut)
            .onComplete(() => {
                if (this.targetKeyframe !== key) return;
                this.currentKeyframe = key;
                this.targetKeyframe = undefined;
                this.activeTweens = [];
                if (callback) callback();
            });

        const focTween = new TWEEN.Tween(this.focalPoint)
            .to(keyframe.focalPoint, duration)
            .easing(easing || TWEEN.Easing.Quintic.InOut);

        posTween.start();
        focTween.start();
        this.activeTweens = [posTween, focTween];
    }

    setInstance() {
        this.instance = new THREE.PerspectiveCamera(
            35,
            this.sizes.width / this.sizes.height,
            10,
            900000
        );
        this.currentKeyframe = CameraKey.LOADING;

        this.scene.add(this.instance);
    }

    setMonitorListeners() {
        const enterMonitor = () => {
            this.transition(
                CameraKey.MONITOR,
                2000,
                BezierEasing(0.13, 0.99, 0, 1)
            );
            UIEventBus.dispatch('enterMonitor', {});
        };
        const leftMonitor = () => {
            this.transition(CameraKey.DESK);
            UIEventBus.dispatch('leftMonitor', {});
        };

        this.on('enterMonitor', enterMonitor);
        this.on('leftMonitor', leftMonitor);
    }

    setFreeCamListeners() {
        const unsubscribe = UIEventBus.on('freeCamToggle', (toggle: boolean) => {
            if (toggle) {
                this.transition(
                    CameraKey.ORBIT_CONTROLS_START,
                    750,
                    BezierEasing(0.13, 0.99, 0, 1),
                    () => {
                        this.instance.position.copy(
                            this.keyframes.orbitControlsStart.position
                        );

                        this.orbitControls.update();
                        this.freeCam = true;
                    }
                );
                const webgl = document.getElementById('webgl');
                if (webgl) webgl.style.pointerEvents = 'auto';
            } else {
                this.freeCam = false;
                this.transition(
                    CameraKey.IDLE,
                    4000,
                    TWEEN.Easing.Exponential.Out
                );
                const webgl = document.getElementById('webgl');
                if (webgl) webgl.style.pointerEvents = 'none';
            }
        });

        this.unsubscribeListeners.push(unsubscribe);
    }

    setPostLoadTransition() {
        const unsubscribe = UIEventBus.on('loadingScreenDone', () => {
            this.transition(CameraKey.IDLE, 2500, TWEEN.Easing.Exponential.Out);
        });

        this.unsubscribeListeners.push(unsubscribe);
    }

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height;
        this.instance.updateProjectionMatrix();
    }

    createControls() {
        this.renderer = this.application.renderer;
        this.orbitControls = new OrbitControls(
            this.instance,
            this.renderer.instance.domElement
        );

        const { x, y, z } = this.keyframes.orbitControlsStart.focalPoint;
        this.orbitControls.target.set(x, y, z);

        this.orbitControls.enablePan = false;
        this.orbitControls.enableDamping = true;
        this.orbitControls.object.position.copy(
            this.keyframes.orbitControlsStart.position
        );
        this.orbitControls.dampingFactor = 0.05;
        this.orbitControls.maxPolarAngle = Math.PI / 2;
        this.orbitControls.minDistance = 4000;
        this.orbitControls.maxDistance = 29000;

        this.orbitControls.update();
    }

    update() {
        TWEEN.update();

        if (this.freeCam && this.orbitControls) {
            this.position.copy(this.orbitControls.object.position);
            this.focalPoint.copy(this.orbitControls.target);
            this.orbitControls.update();
            return;
        }

        for (const key in this.keyframes) {
            const _key = key as CameraKey;
            this.keyframes[_key].update();
        }

        if (this.currentKeyframe) {
            const keyframe = this.keyframes[this.currentKeyframe];
            this.position.copy(keyframe.position);
            this.focalPoint.copy(keyframe.focalPoint);
        }

        this.instance.position.copy(this.position);
        this.instance.lookAt(this.focalPoint);
    }

    destroy() {
        document.removeEventListener(
            'mousedown',
            this.documentMouseDownHandler
        );
        this.unsubscribeListeners.forEach((unsubscribe) => unsubscribe());
        this.activeTweens.forEach((tween) => tween.stop());
        this.orbitControls?.dispose();
        super.destroy();
    }
}
