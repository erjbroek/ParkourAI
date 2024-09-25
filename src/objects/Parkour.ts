import { platform } from 'os';
import Obstacle from './Obstacle.js';
import * as THREE from 'three';
import MainCanvas from '../setup/MainCanvas.js';
import ParkourPieces from './ParkourPieces.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import Edit from '../scenes/Edit.js';
import Player from './Player.js';

export default class Parkour {
  public static levels: Obstacle[][] = []

  public activeLevel: number = 0;

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
    Parkour.levels.push([
      this.createObstacle(ParkourPieces.platform, 0, 0, 16),
      this.createObstacle(ParkourPieces.platform, 0, 0, 0),
      this.createObstacle(ParkourPieces.long2, 0, 0, -20),
      this.createObstacle(ParkourPieces.long1, 0, 0, -36),
      this.createObstacle(ParkourPieces.platform, 0, 0, -52),
      this.createObstacle(ParkourPieces.checkPoint, 0, 6.51, -52),
    ]
    );

    // level 1
    Parkour.levels.push([
      this.createObstacle(ParkourPieces.long2, 0, 0, -68),
      this.createObstacle(ParkourPieces.long2, 8, 0, -80, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long2, 16, 0, -88, 0),
      this.createObstacle(ParkourPieces.long1, 16, 0, -100, 0),
      this.createObstacle(ParkourPieces.platform, 16, 0, -112),
      this.createObstacle(ParkourPieces.checkPoint, 16, 6.51, -112),
    ]
    )

    // level 2
    Parkour.levels.push([
      this.createObstacle(ParkourPieces.long2, 16, 0, -128),
      this.createObstacle(ParkourPieces.long2, 16, 0, -156),
      this.createObstacle(ParkourPieces.platform, 16, 0, -172),
      this.createObstacle(ParkourPieces.checkPoint, 16, 6.51, -172)
    ]
    );

    // level 3
    Parkour.levels.push([
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
    Parkour.levels.push([
      this.createObstacle(ParkourPieces.long1, 8, 0, -308),
      this.createObstacle(ParkourPieces.normal, 8, 2, -324),
      this.createObstacle(ParkourPieces.normal, -4, 4, -324),
      this.createObstacle(ParkourPieces.normal, -16, 6, -324),
      this.createObstacle(ParkourPieces.normal, -28, 8, -324),
      this.createObstacle(ParkourPieces.long1, -28, 8, -340),
      this.createObstacle(ParkourPieces.platform, -28, 8, -364),
      this.createObstacle(ParkourPieces.checkPoint, -28, 14.51, -364)
    ]);

    // level 5
    // this is the big level with lots of jumps to test the player
    Parkour.levels.push([
      this.createObstacle(ParkourPieces.normal, -28, 8, -388),
      this.createObstacle(ParkourPieces.normal, -24, 11, -400),
      this.createObstacle(ParkourPieces.normal, -16, 14, -408),
      this.createObstacle(ParkourPieces.normal, -4, 17, -412),
      this.createObstacle(ParkourPieces.normal, 8, 20, -412),
      this.createObstacle(ParkourPieces.normal, 20, 23, -408),
      this.createObstacle(ParkourPieces.normal, 28, 26, -400),
      this.createObstacle(ParkourPieces.normal, 32, 29, -388),
      this.createObstacle(ParkourPieces.long1, 32, 29, -368, 0),
      this.createObstacle(ParkourPieces.platform, 32, 29, -344),
      this.createObstacle(ParkourPieces.checkPoint, 32, 35.51, -344)
    ]);

    Parkour.levels.push([
      this.createObstacle(ParkourPieces.long1, 32, 29, -320),
      this.createObstacle(ParkourPieces.normal, 32, 24, -296),
      this.createObstacle(ParkourPieces.normal, 52, 20, -296),
      this.createObstacle(ParkourPieces.normal, 72, 16, -296),
      this.createObstacle(ParkourPieces.normal, 92, 12, -296),
      this.createObstacle(ParkourPieces.platform, 120, 8, -296, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.checkPoint, 120, 14.51, -296, 0, Math.PI / 2)
    ])

    Parkour.levels.push([
      this.createObstacle(ParkourPieces.long1, 144, 8, -296, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long1, 168, 5, -292, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long1, 192, 8, -296, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long1, 216, 5, -300, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long1, 240, 8, -296, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long1, 264, 5, -292, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long1, 288, 8, -296, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.platform, 312, 8, -296, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.checkPoint, 312, 14.51, -296, 0, Math.PI / 2)
    ])

    Parkour.levels.push([
      this.createObstacle(ParkourPieces.long1, 340, 8, -300, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long1, 340, 12, -292, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long1, 340, 16, -300, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long1, 340, 20, -292, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long1, 340, 24, -300, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long1, 340, 28, -292, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long1, 340, 32, -300, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long1, 340, 36, -292, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long1, 340, 40, -300, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long1, 340, 44, -292, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long1, 340, 48, -300, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long1, 340, 52, -292, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long1, 340, 52, -280, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long1, 340, 52, -268, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.platform, 340, 52, -248),
      this.createObstacle(ParkourPieces.checkPoint, 340, 58.51, -248),
    ]);

    Parkour.levels.push([
      this.createObstacle(ParkourPieces.long1, 340, 52, -228, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long1, 340, 52, -208, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long1, 340, 52, -188, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long1, 340, 52, -168, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long1, 340, 52, -148, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long1, 340, 52, -128, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long1, 340, 52, -108, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.long1, 340, 52, -88, 0, Math.PI / 2),
      this.createObstacle(ParkourPieces.platform, 340, 52, -68),
      this.createObstacle(ParkourPieces.checkPoint, 340, 58.51, -68),
    ]);

    Parkour.levels.push([
      this.createObstacle(ParkourPieces.normal, 340, 52, -44),
      this.createObstacle(ParkourPieces.normal, 340, 52, -28),
      this.createObstacle(ParkourPieces.long1, 340, 10, 12),
      this.createObstacle(ParkourPieces.platform, 340, 10, 36),
      this.createObstacle(ParkourPieces.checkPoint, 340, 16.51, 36)
    ]);


    this.renderParkour(Parkour.levels[0]);
    this.renderParkour(Parkour.levels[1]);
    this.renderParkour(Parkour.levels[2]);
    this.renderParkour(Parkour.levels[3]);
    this.renderParkour(Parkour.levels[4]);
    this.renderParkour(Parkour.levels[5]);
    this.renderParkour(Parkour.levels[6]);
    this.renderParkour(Parkour.levels[7]);
    this.renderParkour(Parkour.levels[8]);
    this.renderParkour(Parkour.levels[9]);
    this.renderParkour(Parkour.levels[10]);
  }

  // checks collision between the player and specified levels
  // is used to check if the player can jump and if checkpoint is reached
  public checkCollision(player: Player): void {
    let levels: Obstacle[][] = [Parkour.levels[player.currentLevel]];
  
    if (player.currentLevel > 0) {
      levels.push(Parkour.levels[player.currentLevel - 1]);
    }
  
    player.onGround = false;
  
    levels.forEach((level, index) => {
      level.forEach((object) => {

        if (object.isCheckpoint) {
          if (object.boundingBox.intersectsBox(player.boundingBox) && index === 0) {
            player.currentLevel += 1;
  
            object.mesh.material = ParkourPieces.checkPointActive;
            const objectHeight = object.boundingBox.max.y - object.boundingBox.min.y;
            player.spawnPoint = new THREE.Vector3(
              object.mesh.position.x,
              object.mesh.position.y - objectHeight / 2,
              object.mesh.position.z
            );
  
            levels[0] = Parkour.levels[player.currentLevel];
  
            return;
          }
        } else {
          const obstacleTopY = object.boundingBox.max.y;
          const playerMinY = player.boundingBox.min.y;
  
          if (object.boundingBox.intersectsBox(player.boundingBox) && playerMinY >= obstacleTopY - 0.1) {
            player.playerBody.angularVelocity.y *= 0.5;
            player.playerBody.angularVelocity.x *= 0.5;
            player.playerBody.angularVelocity.z *= 0.5;
            object.isColliding = true;
            player.onGround = true;
            if (player.index == 0) {
              console.log(`colliding with object ${level.indexOf(object)}`);
            }
          } else {
            object.isColliding = false;
          }
        }
      });
    });
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