import * as THREE from 'three';

export const offsetPosition = (
    position: THREE.Vector3,
    offset: THREE.Vector3
) => new THREE.Vector3().copy(position).add(offset);

export const createPlaneMesh = (
    width: number,
    height: number,
    material: THREE.Material,
    position: THREE.Vector3,
    rotation: THREE.Euler
) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
    mesh.position.copy(position);
    mesh.rotation.copy(rotation);
    return mesh;
};
