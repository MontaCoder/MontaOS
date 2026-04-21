import * as THREE from 'three';
import Application from '../Application';
import Resources from '../Utils/Resources';
import Time from '../Utils/Time';

import fragmentShader from '../Shaders/coffee/fragment.glsl';
import vertexShader from '../Shaders/coffee/vertex.glsl';

export default class CoffeeSteam {
    model: {
        color: string;
        material: THREE.ShaderMaterial;
        mesh: THREE.Mesh;
    };
    application: Application;
    resources: Resources;
    scene: THREE.Scene;
    time: Time;

    constructor() {
        this.application = Application.getInstance();
        this.resources = this.application.resources;
        this.scene = this.application.scene;
        this.time = this.application.time;

        this.setModel();
    }

    setModel() {
        const color = '#c9c9c9';

        // Material
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uTimeFrequency: { value: 0.001 },
                uUvFrequency: { value: new THREE.Vector2(3, 5) },
                uColor: { value: new THREE.Color(color) },
            },
        });

        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(280, 700),
            material
        );

        mesh.position.copy(new THREE.Vector3(1670, 200, 900));

        this.model = { color, material, mesh };
        this.scene.add(mesh);
    }

    update() {
        this.model.material.uniforms.uTime.value = this.time.elapsed;
    }
}
