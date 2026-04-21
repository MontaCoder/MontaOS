import * as THREE from 'three';

export default class BakedModel {
    model: LoadedModel;
    texture: LoadedTexture;
    material: THREE.MeshBasicMaterial;

    constructor(model: LoadedModel, texture: LoadedTexture, scale?: number) {
        this.model = model;
        this.texture = texture;

        this.texture.flipY = false;
        this.texture.encoding = THREE.sRGBEncoding;

        this.material = new THREE.MeshBasicMaterial({
            map: this.texture,
        });

        this.model.scene.traverse((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh) {
                const mesh = child as THREE.Mesh;
                if (scale) mesh.scale.set(scale, scale, scale);

                const material = mesh.material as THREE.MeshBasicMaterial;
                material.map = this.texture;
                mesh.material = this.material;
            }
        });

        return this;
    }

    getModel(): THREE.Group {
        return this.model.scene;
    }
}
