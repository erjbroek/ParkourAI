import { platform } from 'os';
import Obstacle from './Obstacle.js';
import * as THREE from 'three';
import MainCanvas from '../setup/MainCanvas.js';
import ParkourPieces from './ParkourPieces.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import Edit from '../scenes/Edit.js';
import Player from './Player.js';
import Statistics from '../scenes/Statistics.js';
import Level from './level.js';

export default class Parkour {
  public static levels: Level[] = []

  public activeLevel: number = 0;

  public static addedParkour: Obstacle[][] = [[]];

  // used to display all different objects in the parkour
  public objectArray: Obstacle[] = [];

  private startPosition: THREE.Vector3;

  public constructor() {
    this.startPosition = new THREE.Vector3(0, 0, 0);
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
   * once i enable level creation, make sure that the levels are seperate from these levels
   * meaning, these levels would not be pushed and instead just the players levels would be pushed
   * otherwize, it wont work with collision code
   * 
   * Generates the levels in the parkour
   */
  public generateParkour(): void {
    const level1_Obstacles = [
      this.createObstacle(ParkourPieces.startingPlatform, 0, 0, 20),
      this.createObstacle(ParkourPieces.normal, 8, 0, 4),
      this.createObstacle(ParkourPieces.normal, 8, 0, -6),
      this.createObstacle(ParkourPieces.normal, 8, 0, -16),
      this.createObstacle(ParkourPieces.platform, 0, 0, -32),
      this.createObstacle(ParkourPieces.checkPoint, 0, 6.51, -32),
    ]
    const level1 = new Level(0, level1_Obstacles.slice(0, -1), level1_Obstacles[level1_Obstacles.length - 1], new THREE.Vector3(0, 0.5, 20));

    Parkour.levels.push(level1);

    for(let i = 0; i < Parkour.levels.length; i++) {
      Parkour.levels[i].renderParkour()
    }



    // Parkour.levels.push([
    //   this.createObstacle(ParkourPieces.startingPlatform, 0, 0, 20),
    //   this.createObstacle(ParkourPieces.normal, 8, 0, 4),
    //   this.createObstacle(ParkourPieces.normal, 8, 0, -6),
    //   this.createObstacle(ParkourPieces.normal, 8, 0, -16),
    //   // this.createObstacle(ParkourPieces.long2, 12, 0, 0),
    //   // this.createObstacle(ParkourPieces.long1, 12, 0, -16),
    //   this.createObstacle(ParkourPieces.platform, 0, 0, -32),
    //   this.createObstacle(ParkourPieces.checkPoint, 0, 6.51, -32),
    // ]
    // );

    // Parkour.levels.forEach((level) => {
    //   level.forEach((obstacle) => {
    //     MainCanvas.scene.add(obstacle.mesh);
    //   })
    // })
  
  }

  public checkCollision(player: Player): void {
    player.onGround = false;
    let foundObject: { index: number; object: Obstacle } | null = { index: null, object: null };
    let current: Obstacle = null;
    let next: Obstacle = null;

    const activeLevel: Level = Parkour.levels[this.activeLevel]
    const finished = activeLevel.finishLine.boundingBox.intersectsBox(player.boundingBox)

    // if the player finishes:
    // - the player finished flas gets sets to true (used to track the percentage of finished players)
    // - the mesh gets updated and becomes green to indicate player has reached it
    // - stats get updated for bar graph
    if (finished) {
      player.finished = true
      activeLevel.finishLine.mesh.material = ParkourPieces.checkPointActive;
      if (Statistics.checkpointsReached[player.currentLevel]) {
        Statistics.checkpointsReached[player.currentLevel]++
      } else {
        Statistics.checkpointsReached[player.currentLevel] = 1
      }
    }

    activeLevel.pieces.forEach((piece, pieceIndex) => {
      const pieceTopY = piece.boundingBox.max.y;
      const playerMinY = player.boundingBox.min.y;

      if (piece.boundingBox.intersectsBox(player.boundingBox) && playerMinY >= pieceTopY - 0.1) {
        player.playerBody.angularVelocity.x *= 0.5;
        player.playerBody.angularVelocity.y *= 0.5;
        player.playerBody.angularVelocity.z *= 0.5;

        player.playerBody.velocity.y = 0;
        player.playerBody.position.y = pieceTopY + player.boundingBox.getSize(new THREE.Vector3()).y / 2;
        player.playerBody.quaternion.y = 0
        player.onGround = true;

        foundObject = { index: pieceIndex, object: piece };
      } else if (player.boundingBox.max.x >= piece.boundingBox.min.x && player.boundingBox.min.x <= piece.boundingBox.max.x &&
        player.boundingBox.max.z >= piece.boundingBox.min.z && player.boundingBox.min.z <= piece.boundingBox.max.z &&
        player.boundingBox.min.y >= piece.boundingBox.max.y && player.boundingBox.max.y <= piece.boundingBox.max.y + 0.1) {
        foundObject = { index: pieceIndex, object: piece };
      }
    })
    if (foundObject.index != null) {
      if (activeLevel.pieces.length - 2 > foundObject.index) {
        next = activeLevel.pieces[foundObject.index + 1]
      } else {
        return ;
      }
      
      player.highestObstacleIndex = this.getIndex(foundObject.object);
      player.inputLevels.current = foundObject.object;
      player.inputLevels.next = next
    }

    player.inputLevels.current.mesh.material = ParkourPieces.activeMaterial1;
    player.inputLevels.next.mesh.material = ParkourPieces.activeMaterial2;
  }

// /**
//  * checks collision between the player and all jumps in the current and previous level
//  * if the object is a checkpoint, the player will move to the next level
//  * if its a normal jump, it sets the active platform the player is on to the platform that is being collided with
//  * if the player is colliding with multiple platforms, it will get the one furthest into the parkour
//  * also checks collision if the player is jumping over a platform by just checking for x and z axis
//  * 
//  * @param player is the player object that is being checked for collision
//  */
//   public checkCollision(player: Player): void {
//     let levels: Obstacle[][] = [Parkour.levels[player.currentLevel]];

//     if (player.currentLevel > 0) {
//       levels.push(Parkour.levels[player.currentLevel - 1]);
//     }

//     player.onGround = false;
//     let foundObject: { index: number; level: number; object: Obstacle } | null = { index: null, level: null, object: null };
//     let current: Obstacle = null;
//     let next: Obstacle = null;

//     levels.forEach((level, levelIndex) => {
//       if (!level) {
//         // still have to write function for this to go to finished screen or whatever
//         return;
//       }
//       level.forEach((object, objectIndex) => {
//         if (object.isCheckpoint) {
//           if (object.boundingBox.intersectsBox(player.boundingBox) && levelIndex === 0) {
//             if (Statistics.checkpointsReached[player.currentLevel]) {
//               Statistics.checkpointsReached[player.currentLevel]++
//             } else {
//               Statistics.checkpointsReached[player.currentLevel] = 1
//             }
//             player.currentLevel += 1;
//             player.deathTimer = player.deathTime * level.length;
//             object.mesh.material = ParkourPieces.checkPointActive;
//             const objectHeight = object.boundingBox.max.y - object.boundingBox.min.y;
//             player.spawnPoint = new THREE.Vector3(
//               object.mesh.position.x,
//               object.mesh.position.y - objectHeight / 2,
//               object.mesh.position.z
//             );
//             return;
//           }
//         } else {
//           const obstacleTopY = object.boundingBox.max.y;
//           const playerMinY = player.boundingBox.min.y;
//           // object.mesh.material = ParkourPieces.material;
//           // if player collides with object
//           if (object.boundingBox.intersectsBox(player.boundingBox) && playerMinY >= obstacleTopY - 0.1) {
//             player.playerBody.angularVelocity.x *= 0.5;
//             player.playerBody.angularVelocity.y *= 0.5;
//             player.playerBody.angularVelocity.z *= 0.5;

//             player.playerBody.velocity.y = 0;
//             player.playerBody.position.y = obstacleTopY + player.boundingBox.getSize(new THREE.Vector3()).y / 2;
//             player.playerBody.quaternion.y = 0
//             player.onGround = true;

//             foundObject = { index: objectIndex, level: levelIndex, object: object };

//           } else if (player.boundingBox.max.x >= object.boundingBox.min.x && player.boundingBox.min.x <= object.boundingBox.max.x &&
//             player.boundingBox.max.z >= object.boundingBox.min.z && player.boundingBox.min.z <= object.boundingBox.max.z &&
//             player.boundingBox.min.y >= object.boundingBox.max.y && player.boundingBox.max.y <= object.boundingBox.max.y + 0.1) {
//             foundObject = { index: objectIndex, level: levelIndex, object: object };
//           }
//         }
//       });
//     });

//     if (foundObject.index != null) {
//       // a verify if a level has been found
//       const foundLevel = Parkour.levels.find(level => level.includes(foundObject.object));
//       if (foundLevel) {
//         // tries to find the next object,
//         // if the next object is valid (and not a parkour piece), that gets set as the "next" object
//         if (Parkour.levels[Parkour.levels.indexOf(foundLevel)].length - 2 > foundObject.index) {
//           next = Parkour.levels[Parkour.levels.indexOf(foundLevel)][foundObject.index + 1]
//         } else {
//           // if the next piece however, is the checkpoint, then the first item from the next level is taken
//           // (only if there is a next level)
//           const nextLevel = Parkour.levels[Parkour.levels.indexOf(foundLevel) + 1];
//           if (nextLevel) {
//             next = nextLevel[0];
//           } else {
//             return;
//           }
//         }
//         // is used for the scoring, since each incrememt of this increases fitness by 25
//         // (so, every jump the player makes, it gets 25 "points")
//         player.highestObstacleIndex = this.getIndex(foundObject.object);
//       }
//       // these are used for inputs of the players neural network
//       player.inputLevels.current = foundObject.object
//       player.inputLevels.next = next
//     }
//     // meshes are updated, so that they have a different color (for visual purposes in more understanding what the player sees)
//     player.inputLevels.current.mesh.material = ParkourPieces.activeMaterial1;
//     player.inputLevels.next.mesh.material = ParkourPieces.activeMaterial2;
//   }

  public getIndex(obstacle: Obstacle): number {
    let count: number = 0;
    for (const level of Parkour.levels) {
      for (const object of level.pieces) {
        if (object === obstacle) {
          return count;
        } else {
          count++;
        }
      }
    }
    return -1;
  }
}