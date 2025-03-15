import Obstacle from './Obstacle.js';
import * as THREE from 'three';
import ParkourPieces from './ParkourPieces.js';
import MainCanvas from '../setup/MainCanvas.js';


export default class Level {
  public pieces: Obstacle[];

  private location: THREE.Vector3;
  
  private spawnPoint: THREE.Vector3;
  
  public finishLine: Obstacle;

  public constructor(index: number, objects: Obstacle[], finishLine: Obstacle, spawnpoint: THREE.Vector3) {
    this.location = new THREE.Vector3(index * 100, 0, 0);
    this.pieces = objects;
    this.finishLine = finishLine;
    this.spawnPoint = spawnpoint;


    // const obstacle = new Obstacle(ParkourPieces.levelBorder.clone(), { posX: this.location.x, posY: 0, posZ: 0 });
    // MainCanvas.scene.add(obstacle.mesh);
  }

   /**
   * Adds the level meshes to the scene
   * 
   * @param level is an array containing the meshes/ obstacles that should be added
   */
   public renderParkour(): void {
    this.pieces.forEach((obstacle) => {
      MainCanvas.scene.add(obstacle.mesh);
    })
  }
}