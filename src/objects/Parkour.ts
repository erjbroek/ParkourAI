import { platform } from 'os';
import Obstacle from './Obstacle.js';
import * as THREE from 'three';
import MainCanvas from '../setup/MainCanvas.js';
import ParkourPieces from './ParkourPieces.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import Edit from '../scenes/Edit.js';

export default class Parkour {
  public static level: Obstacle[][] = []

  public static activeLevel: number = 0;

  public static addedParkour: Obstacle[][] = [[]];

  // used to display all different objects in the parkour
  public objectArray: Obstacle[] = [];

  public constructor() {

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

  /**
   * Generates the levels in the parkour
   */
  public generateParkour(): void {
    Parkour.level.push([
      this.createObstacle(ParkourPieces.platform, 0, 0, 0),
      this.createObstacle(ParkourPieces.long2, 0, 0, -16),
      this.createObstacle(ParkourPieces.long2, 0, 0, -34),
      this.createObstacle(ParkourPieces.checkPoint, 0, 6.51, -52),
      this.createObstacle(ParkourPieces.platform, 0, 0, -52),
    ]
    );

    Parkour.level.push([
      this.createObstacle(ParkourPieces.long2, 0, 0, -68),
      this.createObstacle(ParkourPieces.long2, 8, 0, -80, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long2, 16, 0, -88, 0),
      this.createObstacle(ParkourPieces.long1, 16, 0, -100, 0),
      this.createObstacle(ParkourPieces.platform, 16, 0, -112),
      this.createObstacle(ParkourPieces.checkPoint, 16, 6.51, -112),
      ]
    )

    Parkour.level.push([
      this.createObstacle(ParkourPieces.long2, 16, 0, -130),
      this.createObstacle(ParkourPieces.long1, 16, 0, -154),  
      this.createObstacle(ParkourPieces.platform, 16, 0, -170),
      this.createObstacle(ParkourPieces.checkPoint, 16, 6.51, -170)
    ]
    );

    this.renderParkour(Parkour.level[0]);
    this.renderParkour(Parkour.level[1]);
    this.renderParkour(Parkour.level[2])
  }

  /**
   * Adds the level meshes to the scene
   * 
   * @param level is an array containing the meshes/ obstacles that should be added
   */
  public renderParkour(level: Obstacle[]): void {
    level.forEach((obstacle) => {
      MainCanvas.scene.add(obstacle.mesh);
    })
  }
}