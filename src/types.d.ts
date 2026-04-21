type Resource =
    | TextureResource
    | CubeTextureResource
    | ModelResource
    | AudioResource;

declare interface StyleSheetCSS {
    [key: string]: import('react').CSSProperties;
}

declare module '*.svg' {
    const src: string;
    export default src;
}

declare module '*.glsl' {
    const src: string;
    export default src;
}

declare module '*.vert' {
    const src: string;
    export default src;
}

declare module '*.frag' {
    const src: string;
    export default src;
}

declare module '*.css' {
    const src: string;
    export default src;
}

type TextureResource = {
    name: string;
    type: 'texture';
    path: string;
};

type CubeTextureResource = {
    name: string;
    type: 'cubeTexture';
    path: string[];
};

type ModelResource = {
    name: string;
    type: 'gltfModel';
    path: string;
};

type AudioResource = {
    name: string;
    type: 'audio';
    path: string;
};

type EnclosingPlane = {
    size: import('three').Vector2;
    position: import('three').Vector3;
    rotation: import('three').Euler;
};

type CameraKeyframe = {
    position: import('three').Vector3;
    focalPoint: import('three').Vector3;
};

type LoadedResource =
    | LoadedTexture
    | LoadedCubeTexture
    | LoadedModel
    | LoadedAudio;

type LoadedTexture = import('three').Texture;

type LoadedModel = import('three/examples/jsm/loaders/GLTFLoader').GLTF;

type LoadedCubeTexture = import('three').CubeTexture;

type LoadedAudio = AudioBuffer;

type ResourceType = 'texture' | 'cubeTexture' | 'gltfModel' | 'audio';

type UIEventMap = {
    loadedSource: {
        sourceName: string;
        progress: number;
        toLoad: number;
        loaded: number;
    };
    loadingFailed: {
        sourceName: string;
        path: string | string[];
        error: unknown;
    };
    loadingScreenDone: {};
    enterMonitor: {};
    leftMonitor: {};
    freeCamToggle: boolean;
    muteToggle: boolean;
};

type UIEventName = keyof UIEventMap;

type EventUnsubscribe = () => void;

interface ComputerEvent extends Event {
    inComputer?: boolean;
    clientX?: number;
    clientY?: number;
    key?: string;
}

interface ComputerMouseEvent extends MouseEvent {
    inComputer?: boolean;
}
