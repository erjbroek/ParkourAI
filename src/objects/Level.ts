import Obstacle from './Obstacle.js';
import * as THREE from 'three';
import ParkourPieces from './ParkourPieces.js';
import MainCanvas from '../setup/MainCanvas.js';


export default class Level {
  public pieces: Obstacle[] = [];

  public location: THREE.Vector3;
  
  public spawnPoint: THREE.Vector3;
  
  public finishLine: Obstacle;

  public index: number;

  public finished: boolean = false;

  public constructor(index: number, pieces: any[][], spawnpoint: THREE.Vector3) {
    this.index = index;
    this.location = new THREE.Vector3((index % 10) * 150, 0, -Math.floor(index / 10) * 150);
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
  }

   /**
   * Adds the level meshes to the scene
   * 
   * @param level is an array containing the meshes/ obstacles that should be added
   */
   public renderParkour(): void {
    this.pieces.forEach((obstacle) => {
      MainCanvas.scene.add(obstacle.mesh);4    })

    MainCanvas.scene.add(this.finishLine.mesh)
    const wall1 = new Obstacle(ParkourPieces.levelBorder.clone(), {posX: this.location.x, posY: 0, posZ: this.location.z})
    const wall2 = new Obstacle(ParkourPieces.levelBorder.clone(), {posX: this.location.x, posY: 0, posZ: this.location.z - 150})
    const wall3 = new Obstacle(ParkourPieces.levelBorder.clone(), {posX: this.location.x - 75, posY: 0, posZ: this.location.z - 75, rotationX: 0, rotationY: Math.PI / 2})
    const wall4 = new Obstacle(ParkourPieces.levelBorder.clone(), {posX: this.location.x + 75, posY: 0, posZ: this.location.z - 75, rotationX: 0, rotationY: Math.PI / 2})

    MainCanvas.scene.add(wall1.mesh)
    MainCanvas.scene.add(wall2.mesh)
    MainCanvas.scene.add(wall3.mesh)
    MainCanvas.scene.add(wall4.mesh)
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