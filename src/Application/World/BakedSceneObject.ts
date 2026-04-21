import * as THREE from 'three';
import Application from '../Application';
import BakedModel from '../Utils/BakedModel';
import Resources from '../Utils/Resources';

type BakedSceneObjectOptions = {
    model: string;
    texture: string;
    scale?: number;
};

export default class BakedSceneObject {
    private scene: THREE.Scene;
    private resources: Resources;
    private bakedModel: BakedModel;

    constructor({ model, texture, scale }: BakedSceneObjectOptions) {
        const application = Application.getInstance();
        this.scene = application.scene;
        this.resources = application.resources;

        this.bakedModel = new BakedModel(
            this.resources.items.gltfModel[model],
            this.resources.items.texture[texture],
            scale
        );

        this.scene.add(this.bakedModel.getModel());
    }

    update() {}
}
