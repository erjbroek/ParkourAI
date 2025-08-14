import Obstacle from './Obstacle.js';
import * as THREE from 'three';
import MainCanvas from '../setup/MainCanvas.js';
export default class Level {
    constructor(index, pieces, islands, foliage, spawnpoint, time, added_camera_position = new THREE.Vector3(0, 0, 0), camera_rotation = new THREE.Vector3(-0.643536637648491, -0.5225529300689504, -0.3581991118441852)) {
        this.pieces = [];
        this.finished = false;
        this.index = index;
        this.islands = islands;
        this.foliage = foliage;
        const spread = 1.3;
        const scale = 1.2;
        const gridSize = 3;
        this.location = new THREE.Vector3((index % gridSize) * 150 * spread * scale, 0, -Math.floor(index / gridSize) * 150 * spread * scale);
        const geometry = new THREE.CylinderGeometry(90, 90, 5, 22, 4, true);
        const material = new THREE.ShaderMaterial({
            vertexShader: `
        varying float vHeight;
        void main() {
          vHeight = position.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
            fragmentShader: `
        varying float vHeight;
        void main() {
          float opacity = 0.75 - (vHeight + 5.0) / 8.0; // Map height to opacity
          gl_FragColor = vec4(1, 1, 1, opacity);
        }
      `,
            transparent: true,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(geometry, material);
        ring.position.add(this.location);
        ring.position.z -= 70;
        ring.position.y -= 5.2;
        MainCanvas.scene.add(ring);
        //   if (this.index == 9) {
        //     const loader = new GLTFLoader();
        //     loader.load('./assets/floorflat.glb', (gltf) => {
        //       gltf.scene.position.set((index % gridSize) * 150 * spread * scale, -22, -Math.floor(index / gridSize) * 150 * spread * scale - 75 - 500);
        //       const rotations = [Math.PI / 2, Math.PI, 3 * Math.PI / 2, 2 * Math.PI];
        //       const randomRotation = rotations[Math.floor(Math.random() * rotations.length)];
        //       // gltf.scene.rotation.y = randomRotation;
        //       gltf.scene.scale.set(20 * scale, 10, 40 * scale);
        //       MainCanvas.scene.add(gltf.scene);
        //   });
        // }
        pieces.forEach((piece, idx) => {
            const [mesh, posX, posY, posZ, rotationX = 0, rotationY = 0, rotationZ = 0] = piece;
            const obstacle = this.createObstacle(mesh, posX + this.location.x, posY + this.location.y, posZ + this.location.z, rotationX, rotationY, rotationZ);
            if (idx == 1) {
                console.log(obstacle);
            }
            if (idx !== pieces.length - 1) {
                this.pieces.push(obstacle);
            }
            else {
                this.finishLine = obstacle;
            }
        });
        this.spawnPoint = spawnpoint.clone().add(this.location);
        this.time = time;
        this.maxTime = time;
        this.addedCameraPosition = added_camera_position;
        this.cameraRotation = camera_rotation;
    }
    async loadJSON() {
        try {
            const response = await fetch(`/jsonProgress/level${this.index}finished.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            let population = [];
            const json = await response.json();
            this.trainedNetwork = json;
        }
        catch (error) {
            console.error(`Failed to load JSON for level ${this.index}:`, error);
        }
    }
    resetCamera() {
        MainCanvas.camera.position.set(this.location.x - 60, this.location.y + 50, this.location.z);
        MainCanvas.camera.rotation.set(this.cameraRotation.x, this.cameraRotation.y, this.cameraRotation.z);
    }
    /**
    * Adds the level meshes to the scene
    *
    * @param level is an array containing the meshes/ obstacles that should be added
    */
    renderParkour() {
        this.pieces.forEach((obstacle) => {
            MainCanvas.scene.add(obstacle.mesh);
        });
        MainCanvas.scene.add(this.finishLine.mesh);
        this.islands.forEach((island) => {
            island.render(this.location);
        });
        this.foliage.forEach((piece) => {
            piece.render(this.location);
        });
    }
    /**
    * Removes the level meshes from the scene
    */
    unloadParkour() {
        this.pieces.forEach((obstacle) => {
            MainCanvas.scene.remove(obstacle.mesh);
        });
        MainCanvas.scene.remove(this.finishLine.mesh);
    }
    /**
   * Creates obstacle
   *
   * Instead of using mesh, it is used as Obstacle
   * this way, controlling the parkour jumps is easier
   * think of things like moving obstacles, ect.
   */
    createObstacle(mesh, posX, posY, posZ, rotationX = 0, rotationY = 0, rotationZ = 0) {
        return new Obstacle(mesh.clone(), { posX, posY, posZ, rotationX, rotationY, rotationZ });
    }
}
