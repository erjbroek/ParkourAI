import * as THREE from 'three';
import MainCanvas from '../setup/MainCanvas.js';
export default class Island {
    constructor(position, dimensions, addGround = true, addGrass = true) {
        this.grassMaterial = new THREE.MeshPhongMaterial({ color: 0x32CD32 });
        this.groundMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        this.position = position;
        this.islandDimensions = dimensions;
        this.addground = addGround;
        this.addGrass = addGrass;
        this.grassMesh = new THREE.Mesh(new THREE.BoxGeometry(dimensions.x + 4, 2, dimensions.z + 4), this.grassMaterial);
        this.grassMesh.position.set(position.x, position.y + 0.55, position.z);
        // this.grassMesh.material.color = {r:1, g:1, b:1}
        if (!this.addGrass) {
            this.groundMesh = new THREE.Mesh(new THREE.BoxGeometry(dimensions.x, dimensions.y + 3, dimensions.z), this.groundMaterial);
            this.groundMesh.position.set(position.x, (position.y) / 2, position.z);
        }
        else {
            this.groundMesh = new THREE.Mesh(new THREE.BoxGeometry(dimensions.x, position.y + 30, dimensions.z), this.groundMaterial);
            this.groundMesh.position.set(position.x, (position.y - 30) / 2, position.z);
        }
    }
    render(position) {
        this.grassMesh.position.add(position);
        this.groundMesh.position.add(position);
        if (this.addground) {
            MainCanvas.scene.add(this.groundMesh);
        }
        if (this.addGrass) {
            MainCanvas.scene.add(this.grassMesh);
        }
    }
}
