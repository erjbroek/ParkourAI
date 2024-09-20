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
    // level 0
    Parkour.level.push([
      this.createObstacle(ParkourPieces.platform, 0, 0, 16),
      this.createObstacle(ParkourPieces.platform, 0, 0, 0),
      this.createObstacle(ParkourPieces.long2, 0, 0, -16),
      this.createObstacle(ParkourPieces.long2, 0, 0, -34),
      this.createObstacle(ParkourPieces.checkPoint, 0, 6.51, -52),
      this.createObstacle(ParkourPieces.platform, 0, 0, -52),
    ]
    );

    // level 1
    Parkour.level.push([
      this.createObstacle(ParkourPieces.long2, 0, 0, -68),
      this.createObstacle(ParkourPieces.long2, 8, 0, -80, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long2, 16, 0, -88, 0),
      this.createObstacle(ParkourPieces.long1, 16, 0, -100, 0),
      this.createObstacle(ParkourPieces.platform, 16, 0, -112),
      this.createObstacle(ParkourPieces.checkPoint, 16, 6.51, -112),
    ]
    )

    // level 2
    Parkour.level.push([
      this.createObstacle(ParkourPieces.long2, 16, 0, -128),
      this.createObstacle(ParkourPieces.long2, 16, 0, -156),
      this.createObstacle(ParkourPieces.platform, 16, 0, -172),
      this.createObstacle(ParkourPieces.checkPoint, 16, 6.51, -172)
    ]
    );

    // level 3
    Parkour.level.push([
      this.createObstacle(ParkourPieces.long1, 16, 0, -188),
      this.createObstacle(ParkourPieces.long1, 16, 0, -208),
      this.createObstacle(ParkourPieces.long1, 16, 0, -228),
      this.createObstacle(ParkourPieces.long1, 12, 0, -232, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long1, 8, 0, -236, 0),
      this.createObstacle(ParkourPieces.long1, 8, 0, -256, 0),
      this.createObstacle(ParkourPieces.long1, 8, 0, -276, 0),
      this.createObstacle(ParkourPieces.platform, 8, 0, -292),
      this.createObstacle(ParkourPieces.checkPoint, 8, 6.51, -292)
    ]);

    // level 4
    Parkour.level.push([
      this.createObstacle(ParkourPieces.long1, 8, 0, -308),
      this.createObstacle(ParkourPieces.normal, 8, 2, -324),
      this.createObstacle(ParkourPieces.normal, -4, 4, -324),
      this.createObstacle(ParkourPieces.normal, -16, 6, -324),
      this.createObstacle(ParkourPieces.normal, -28, 8, -324),
      this.createObstacle(ParkourPieces.long1, -28, 8, -340),
      this.createObstacle(ParkourPieces.platform, -28, 8, -364),
      this.createObstacle(ParkourPieces.checkPoint, -28, 14.51, -364)
    ])


    this.renderParkour(Parkour.level[0]);
    this.renderParkour(Parkour.level[1]);
    this.renderParkour(Parkour.level[2]);
    this.renderParkour(Parkour.level[3]);
    this.renderParkour(Parkour.level[4]);
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