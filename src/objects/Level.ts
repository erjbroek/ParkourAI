import Obstacle from './Obstacle.js';
import * as THREE from 'three';
import ParkourPieces from './ParkourPieces.js';
import MainCanvas from '../setup/MainCanvas.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


export default class Level {
  public pieces: Obstacle[] = [];

  public location: THREE.Vector3;
  
  public spawnPoint: THREE.Vector3;
  
  public finishLine: Obstacle;

  public index: number;

  public finished: boolean = false;

  public time: number;

  public maxTime: number;

  public constructor(index: number, pieces: any[][], spawnpoint: THREE.Vector3, time: number) {
    this.index = index;
    const spread = 1.6
    const scale = 1.2
    const gridSize = 3
    this.location = new THREE.Vector3((index % gridSize) * 150 * spread * scale, 0, -Math.floor(index / gridSize) * 150 * spread * scale);
    const loader = new GLTFLoader();
    loader.load('./assets/floorflat.glb', (gltf) => {
      gltf.scene.position.set((index % gridSize) * 150 * spread * scale, -22, -Math.floor(index / gridSize) * 150 * spread * scale - 75);
      const rotations = [Math.PI / 2, Math.PI, 3 * Math.PI / 2, 2 * Math.PI];
      const randomRotation = rotations[Math.floor(Math.random() * rotations.length)];
      gltf.scene.rotation.y = randomRotation;
      gltf.scene.scale.set(20 * scale, 10, 20 * scale);
      MainCanvas.scene.add(gltf.scene);
    });

    pieces.forEach((piece, idx) => {
      const [mesh, posX, posY, posZ, rotationX = 0, rotationY = 0, rotationZ = 0] = piece;
      const obstacle = this.createObstacle(mesh, posX + this.location.x, posY + this.location.y, posZ + this.location.z, rotationX, rotationY, rotationZ);
      if (idx !== pieces.length - 1) {
      this.pieces.push(obstacle);
      } else {
      this.finishLine = obstacle;
      }
    });
    this.spawnPoint = spawnpoint.clone().add(this.location);
    this.time = time
    this.maxTime = time
  }

  /**
  * Adds the level meshes to the scene
  * 
  * @param level is an array containing the meshes/ obstacles that should be added
  */
  public renderParkour(): void {
    this.pieces.forEach((obstacle) => {
      MainCanvas.scene.add(obstacle.mesh)
    })

    MainCanvas.scene.add(this.finishLine.mesh)
  }

  /**
  * Removes the level meshes from the scene
  */
  public unloadParkour(): void {
    this.pieces.forEach((obstacle) => {
      MainCanvas.scene.remove(obstacle.mesh)
    })

    MainCanvas.scene.remove(this.finishLine.mesh)
  }



    /**
 * Creates obstacle
 * 
 * Instead of using mesh, it is used as Obstacle 
 * this way, controlling the parkour jumps is easier
 * think of things like moving obstacles, ect.
 */
    private createObstacle(mesh: THREE.Mesh, posX: number, posY: number, posZ: number, rotationX = 0, rotationY = 0, rotationZ = 0): Obstacle {
      return new Obstacle(mesh.clone(), { posX, posY, posZ, rotationX, rotationY, rotationZ });
    }
}