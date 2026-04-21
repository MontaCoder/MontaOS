import AudioManager from './AudioManager';
import * as THREE from 'three';
import UIEventBus from '../UI/EventBus';

export class AudioSource {
    manager: AudioManager;

    constructor(manager: AudioManager) {
        this.manager = manager;
    }

    update() {}

    destroy() {}
}
export class ComputerAudio extends AudioSource {
    lastKey: string;
    private cleanupListeners: EventUnsubscribe[];

    constructor(manager: AudioManager) {
        super(manager);
        this.cleanupListeners = [];

        const onMouseDown = (event: ComputerMouseEvent) => {
            if (event.inComputer) {
                this.manager.playAudio('mouseDown', {
                    volume: 0.8,
                    position: new THREE.Vector3(800, -300, 1200),
                });
            }
        };

        const onMouseUp = (event: ComputerMouseEvent) => {
            if (event.inComputer) {
                this.manager.playAudio('mouseUp', {
                    volume: 0.8,
                    position: new THREE.Vector3(800, -300, 1200),
                });
            }
        };

        const onKeyUp = (event: ComputerEvent) => {
            if (event.inComputer) {
                this.lastKey = '';
            }
        };

        const onKeyDown = (event: ComputerEvent) => {
            if (!event.key) return;

            if (event.key.includes('_AUTO_')) {
                this.manager.playAudio('ccType', {
                    volume: 0.1,
                    randDetuneScale: 0,
                    pitch: 20,
                });
                return;
            }
            if (this.lastKey === event.key) return;
            this.lastKey = event.key;

            if (event.inComputer) {
                this.manager.playAudio('keyboardKeydown', {
                    volume: 0.8,
                    position: new THREE.Vector3(-300, -400, 1200),
                });
            }
        };

        document.addEventListener('mousedown', onMouseDown as EventListener);
        document.addEventListener('mouseup', onMouseUp as EventListener);
        document.addEventListener('keyup', onKeyUp as EventListener);
        document.addEventListener('keydown', onKeyDown as EventListener);

        this.cleanupListeners = [
            () =>
                document.removeEventListener(
                    'mousedown',
                    onMouseDown as EventListener
                ),
            () =>
                document.removeEventListener(
                    'mouseup',
                    onMouseUp as EventListener
                ),
            () =>
                document.removeEventListener('keyup', onKeyUp as EventListener),
            () =>
                document.removeEventListener(
                    'keydown',
                    onKeyDown as EventListener
                ),
        ];
    }

    destroy() {
        this.cleanupListeners.forEach((cleanup) => cleanup());
        this.cleanupListeners = [];
    }
}

export class AmbienceAudio extends AudioSource {
    poolKey: string | undefined;
    private unsubscribeLoadingDone: EventUnsubscribe;

    constructor(manager: AudioManager) {
        super(manager);
        this.unsubscribeLoadingDone = UIEventBus.on('loadingScreenDone', () => {
            this.poolKey = this.manager.playAudio('office', {
                volume: 1,
                loop: true,
                randDetuneScale: 0,
                filter: {
                    type: 'lowpass',
                    frequency: 1000,
                },
            });
            this.manager.playAudio('startup', {
                volume: 0.4,
                randDetuneScale: 0,
            });
        });
    }

    mapValues(
        input: number,
        input_start: number,
        input_end: number,
        output_start: number,
        output_end: number
    ) {
        return (
            output_start +
            ((output_end - output_start) / (input_end - input_start)) *
                (input - input_start)
        );
    }

    update() {
        const cameraPosition =
            this.manager.application.camera.instance.position;
        const y = cameraPosition.y;
        const x = cameraPosition.x;
        const z = cameraPosition.z;

        // calculate distance to origin
        const distance = Math.sqrt(x * x + y * y + z * z);

        const freq = this.mapValues(distance, 0, 10000, 100, 22000);

        const volume = this.mapValues(distance, 1200, 10000, 0, 0.2);
        const volumeClamped = Math.min(Math.max(volume, 0.05), 0.1);

        if (!this.poolKey) return;

        this.manager.setAudioFilterFrequency(this.poolKey, freq - 3000);
        this.manager.setAudioVolume(this.poolKey, volumeClamped);
    }

    destroy() {
        this.unsubscribeLoadingDone();
    }
}
