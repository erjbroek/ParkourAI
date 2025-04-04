import Obstacle from './Obstacle.js';
import * as THREE from 'three';
import ParkourPieces from './ParkourPieces.js';
import MainCanvas from '../setup/MainCanvas.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Island from './Island.js';


export default class Level {
  public pieces: Obstacle[] = [];

  public location: THREE.Vector3;
  
  public spawnPoint: THREE.Vector3;
  
  public finishLine: Obstacle;

  public index: number;

  public finished: boolean = false;

  public time: number;

  public maxTime: number;

  public islands: Island[];

  public constructor(index: number, pieces: any[][], islands: Island[], spawnpoint: THREE.Vector3, time: number) {
    this.index = index;
    this.islands = islands
    const spread = 1.3
    const scale = 1.2
    const gridSize = 3
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
          float opacity = 0.55 - (vHeight + 5.0) / 8.0; // Map height to opacity
          gl_FragColor = vec4(0.4, 1.0, 0.8, opacity);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    const ring = new THREE.Mesh(geometry, material);
    ring.position.add(this.location);
    ring.position.z -= 70; // Adjust the value as needed
    ring.position.y -= 5.2;
    MainCanvas.scene.add(ring);
    // const loader = new GLTFLoader();
    // loader.load('./assets/floorflat.glb', (gltf) => {
    //   gltf.scene.position.set((index % gridSize) * 150 * spread * scale, -22, -Math.floor(index / gridSize) * 150 * spread * scale - 75);
    //   const rotations = [Math.PI / 2, Math.PI, 3 * Math.PI / 2, 2 * Math.PI];
    //   const randomRotation = rotations[Math.floor(Math.random() * rotations.length)];
    //   gltf.scene.rotation.y = randomRotation;
    //   gltf.scene.scale.set(20 * scale, 10, 20 * scale);
    //   MainCanvas.scene.add(gltf.scene);
    // });

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

  public renderIslands(): void {
    this.islands.forEach((island) => {
      island.render(this.location)
    })
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