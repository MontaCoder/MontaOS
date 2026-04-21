import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import Application from '../Application';
import Resources from '../Utils/Resources';
import Camera from '../Camera/Camera';
import {
    MONITOR_DIM_FACTOR,
    MONITOR_ENCLOSING_COLOR,
    MONITOR_IFRAME_PADDING,
    MONITOR_IFRAME_URLS,
    MONITOR_POSITION,
    MONITOR_ROTATION,
    MONITOR_SCREEN_SIZE,
    MONITOR_TEXTURE_LAYER_SCALE,
} from './monitorConfig';
import {
    MonitorMessage,
    createForwardedMonitorEvent,
    isAllowedMonitorMessage,
} from './monitorEvents';
import { createPlaneMesh, offsetPosition } from './monitorGeometry';

type TextureLayer = {
    texture: THREE.Texture;
    blending: THREE.Blending;
    opacity: number;
    offset: number;
};

export default class MonitorScreen {
    application: Application;
    scene: THREE.Scene;
    cssScene: THREE.Scene;
    resources: Resources;
    camera: Camera;
    screenSize: THREE.Vector2;
    position: THREE.Vector3;
    rotation: THREE.Euler;
    prevInComputer: boolean;
    shouldLeaveMonitor: boolean;
    inComputer: boolean;
    mouseClickInProgress: boolean;
    dimmingPlane: THREE.Mesh;
    videoTextures: { [key in string]: THREE.VideoTexture };
    planeNormal: THREE.Vector3;
    viewVector: THREE.Vector3;
    private cleanupListeners: EventUnsubscribe[];
    private videoTextureRetryIds: number[];

    constructor() {
        this.application = Application.getInstance();
        this.scene = this.application.scene;
        this.cssScene = this.application.cssScene;
        this.resources = this.application.resources;
        this.screenSize = new THREE.Vector2(
            MONITOR_SCREEN_SIZE.w,
            MONITOR_SCREEN_SIZE.h
        );
        this.camera = this.application.camera;
        this.position = MONITOR_POSITION.clone();
        this.rotation = MONITOR_ROTATION.clone();
        this.videoTextures = {};
        this.mouseClickInProgress = false;
        this.shouldLeaveMonitor = false;
        this.prevInComputer = false;
        this.inComputer = false;
        this.planeNormal = new THREE.Vector3(0, 0, 1);
        this.viewVector = new THREE.Vector3();
        this.cleanupListeners = [];
        this.videoTextureRetryIds = [];

        this.initializeScreenEvents();
        this.createIframe();
        const maxOffset = this.createTextureLayers();
        this.createEnclosingPlanes(maxOffset);
        this.createPerspectiveDimmer(maxOffset);
    }

    private addListener(
        target: EventTarget,
        type: string,
        listener: EventListener
    ) {
        target.addEventListener(type, listener);
        this.cleanupListeners.push(() =>
            target.removeEventListener(type, listener)
        );
    }

    initializeScreenEvents() {
        const onMouseMove = (event: MouseEvent) => {
            const computerEvent = event as ComputerMouseEvent;
            const target = event.target as HTMLElement | null;
            if (target?.id === 'computer-screen') {
                computerEvent.inComputer = true;
            }

            this.inComputer = Boolean(computerEvent.inComputer);

            if (this.inComputer && !this.prevInComputer) {
                this.camera.trigger('enterMonitor');
            }

            if (
                !this.inComputer &&
                this.prevInComputer &&
                !this.mouseClickInProgress
            ) {
                this.camera.trigger('leftMonitor');
            }

            this.shouldLeaveMonitor =
                !this.inComputer &&
                this.mouseClickInProgress &&
                this.prevInComputer;

            this.application.mouse.trigger('mousemove', [computerEvent]);
            this.prevInComputer = this.inComputer;
        };

        const onMouseDown = (event: MouseEvent) => {
            const computerEvent = event as ComputerMouseEvent;
            this.inComputer = Boolean(computerEvent.inComputer);
            this.application.mouse.trigger('mousedown', [computerEvent]);

            this.mouseClickInProgress = true;
            this.prevInComputer = this.inComputer;
        };

        const onMouseUp = (event: MouseEvent) => {
            const computerEvent = event as ComputerMouseEvent;
            this.inComputer = Boolean(computerEvent.inComputer);
            this.application.mouse.trigger('mouseup', [computerEvent]);

            if (this.shouldLeaveMonitor) {
                this.camera.trigger('leftMonitor');
                this.shouldLeaveMonitor = false;
            }

            this.mouseClickInProgress = false;
            this.prevInComputer = this.inComputer;
        };

        this.addListener(document, 'mousemove', onMouseMove as EventListener);
        this.addListener(document, 'mousedown', onMouseDown as EventListener);
        this.addListener(document, 'mouseup', onMouseUp as EventListener);
    }

    createIframe() {
        const container = document.createElement('div');
        container.style.width = this.screenSize.width + 'px';
        container.style.height = this.screenSize.height + 'px';
        container.style.opacity = '1';
        container.style.background = '#1d2e2f';

        const iframe = document.createElement('iframe');
        iframe.onload = () => {
            if (!iframe.contentWindow) return;

            const onMonitorMessage = (event: MessageEvent<MonitorMessage>) => {
                if (!isAllowedMonitorMessage(event, iframe)) return;

                iframe.dispatchEvent(
                    createForwardedMonitorEvent(event.data, iframe)
                );
            };

            this.addListener(
                window,
                'message',
                onMonitorMessage as EventListener
            );
        };

        iframe.src = MONITOR_IFRAME_URLS.production;
        if (new URLSearchParams(window.location.search).has('dev')) {
            iframe.src = MONITOR_IFRAME_URLS.development;
        }

        iframe.style.width = this.screenSize.width + 'px';
        iframe.style.height = this.screenSize.height + 'px';
        iframe.style.padding = MONITOR_IFRAME_PADDING + 'px';
        iframe.style.boxSizing = 'border-box';
        iframe.style.opacity = '1';
        iframe.className = 'jitter';
        iframe.id = 'computer-screen';
        iframe.frameBorder = '0';
        iframe.title = 'MontaOS';

        container.appendChild(iframe);
        this.createCssPlane(container);
    }

    createCssPlane(element: HTMLElement) {
        const object = new CSS3DObject(element);
        object.position.copy(this.position);
        object.rotation.copy(this.rotation);
        this.cssScene.add(object);

        const material = new THREE.MeshLambertMaterial({
            side: THREE.DoubleSide,
            opacity: 0,
            transparent: true,
            blending: THREE.NoBlending,
        });

        const mesh = createPlaneMesh(
            this.screenSize.width,
            this.screenSize.height,
            material,
            object.position,
            object.rotation
        );
        mesh.scale.copy(object.scale);
        this.scene.add(mesh);
    }

    createTextureLayers() {
        const textures = this.resources.items.texture;

        this.getVideoTexture('video-1');
        this.getVideoTexture('video-2');

        const layers: TextureLayer[] = [
            {
                texture: textures.monitorSmudgeTexture,
                blending: THREE.AdditiveBlending,
                opacity: 0.12,
                offset: 24,
            },
            {
                texture: textures.monitorShadowTexture,
                blending: THREE.NormalBlending,
                opacity: 1,
                offset: 5,
            },
            {
                texture: this.videoTextures['video-1'],
                blending: THREE.AdditiveBlending,
                opacity: 0.5,
                offset: 10,
            },
            {
                texture: this.videoTextures['video-2'],
                blending: THREE.AdditiveBlending,
                opacity: 0.1,
                offset: 15,
            },
        ];

        return layers.reduce((maxOffset, layer) => {
            const offset = layer.offset * MONITOR_TEXTURE_LAYER_SCALE;
            this.addTextureLayer(layer, offset);
            return Math.max(maxOffset, offset);
        }, -1);
    }

    getVideoTexture(videoId: string) {
        const video = document.getElementById(videoId);
        if (!video) {
            const retryId = window.setTimeout(() => {
                this.getVideoTexture(videoId);
            }, 100);
            this.videoTextureRetryIds.push(retryId);
            return;
        }

        this.videoTextures[videoId] = new THREE.VideoTexture(
            video as HTMLVideoElement
        );
    }

    addTextureLayer(layer: TextureLayer, offset: number) {
        const material = new THREE.MeshBasicMaterial({
            map: layer.texture,
            blending: layer.blending,
            side: THREE.DoubleSide,
            opacity: layer.opacity,
            transparent: true,
        });

        const mesh = createPlaneMesh(
            this.screenSize.width,
            this.screenSize.height,
            material,
            offsetPosition(this.position, new THREE.Vector3(0, 0, offset)),
            this.rotation
        );

        this.scene.add(mesh);
    }

    createEnclosingPlanes(maxOffset: number) {
        const halfWidth = this.screenSize.width / 2;
        const halfHeight = this.screenSize.height / 2;
        const halfOffset = maxOffset / 2;

        const planes: EnclosingPlane[] = [
            {
                size: new THREE.Vector2(maxOffset, this.screenSize.height),
                position: offsetPosition(
                    this.position,
                    new THREE.Vector3(-halfWidth, 0, halfOffset)
                ),
                rotation: new THREE.Euler(0, 90 * THREE.MathUtils.DEG2RAD, 0),
            },
            {
                size: new THREE.Vector2(maxOffset, this.screenSize.height),
                position: offsetPosition(
                    this.position,
                    new THREE.Vector3(halfWidth, 0, halfOffset)
                ),
                rotation: new THREE.Euler(0, 90 * THREE.MathUtils.DEG2RAD, 0),
            },
            {
                size: new THREE.Vector2(this.screenSize.width, maxOffset),
                position: offsetPosition(
                    this.position,
                    new THREE.Vector3(0, halfHeight, halfOffset)
                ),
                rotation: new THREE.Euler(90 * THREE.MathUtils.DEG2RAD, 0, 0),
            },
            {
                size: new THREE.Vector2(this.screenSize.width, maxOffset),
                position: offsetPosition(
                    this.position,
                    new THREE.Vector3(0, -halfHeight, halfOffset)
                ),
                rotation: new THREE.Euler(90 * THREE.MathUtils.DEG2RAD, 0, 0),
            },
        ];

        planes.forEach((plane) => this.createEnclosingPlane(plane));
    }

    createEnclosingPlane(plane: EnclosingPlane) {
        const material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            color: MONITOR_ENCLOSING_COLOR,
        });

        this.scene.add(
            createPlaneMesh(
                plane.size.x,
                plane.size.y,
                material,
                plane.position,
                plane.rotation
            )
        );
    }

    createPerspectiveDimmer(maxOffset: number) {
        const material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            color: 0x000000,
            transparent: true,
            blending: THREE.AdditiveBlending,
        });

        this.dimmingPlane = createPlaneMesh(
            this.screenSize.width,
            this.screenSize.height,
            material,
            offsetPosition(this.position, new THREE.Vector3(0, 0, maxOffset - 5)),
            this.rotation
        );

        this.scene.add(this.dimmingPlane);
    }

    update() {
        if (!this.dimmingPlane) return;

        this.viewVector.copy(this.camera.instance.position);
        this.viewVector.sub(this.position);
        this.viewVector.normalize();

        const dot = this.viewVector.dot(this.planeNormal);
        const distance = this.camera.instance.position.distanceTo(
            this.dimmingPlane.position
        );
        const opacity = 1 / (distance / 10000);

        const material = this.dimmingPlane.material;
        if (material instanceof THREE.MeshBasicMaterial) {
            material.opacity =
                (1 - opacity) * MONITOR_DIM_FACTOR +
                (1 - dot) * MONITOR_DIM_FACTOR;
        }
    }

    destroy() {
        this.cleanupListeners.forEach((cleanup) => cleanup());
        this.cleanupListeners = [];
        this.videoTextureRetryIds.forEach((id) => window.clearTimeout(id));
        this.videoTextureRetryIds = [];
        for (const key in this.videoTextures) {
            this.videoTextures[key].dispose();
        }
    }
}
