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

  public static activeLevel: number = 15;

  public static addedParkour: Obstacle[][] = [[]];

  // used to display all different objects in the parkour
  public objectArray: Obstacle[] = [];

  public constructor() {
    this.generateParkour();
  }


  /**
   * once i enable level creation, make sure that the levels are seperate from these levels
   * meaning, these levels would not be pushed and instead just the players levels would be pushed
   * otherwize, it wont work with collision code
   * 
   * Generates the levels in the parkour
   */
  public generateParkour(): void {
    for (let i = 0; i < 150; i++) {

      const level1_Obstacles = [
        [ParkourPieces.startingPlatform, 0, 0, -30],
        [ParkourPieces.startingPlatform, 0, 0, -50],
        [ParkourPieces.startingPlatform, 0, 0, -70],
  
        [ParkourPieces.platform, 0, 0, -90],
        [ParkourPieces.checkPoint, 0, 6.51, -80],
      ]
      const level1 = new Level(i, level1_Obstacles, new THREE.Vector3(0, 1.5, -30));
      Parkour.levels.push(level1);
    }

    for(let i = 0; i < Parkour.levels.length; i++) {
      Parkour.levels[i].renderParkour()
    }
  }

/**
  * checks collision between the player and all jumps in the current and previous level
  * if the object is a checkpoint, the player will move to the next level
  * if its a normal jump, it sets the active platform the player is on to the platform that is being collided with
  * if the player is colliding with multiple platforms, it will get the one furthest into the parkour
  * also checks collision if the player is jumping over a platform by just checking for x and z axis
  * 
  * @param player is the player object that is being checked for collision
  */
  public checkCollision(player: Player): void {
    player.onGround = false;
    let foundObject: { index: number; object: Obstacle } | null = { index: null, object: null };
    let current: Obstacle = null;
    let next: Obstacle = null;

    const activeLevel: Level = Parkour.levels[Parkour.activeLevel]
    const activeIndex: number = Parkour.levels.indexOf(activeLevel)
    const collidingFinishline = activeLevel.finishLine.boundingBox.intersectsBox(player.boundingBox)

    // if the player finishes:
    // - the player finished flag gets sets to true (used to track the percentage of finished players)
    // - the mesh gets updated and becomes green to indicate player has reached it
    // - stats get updated for bar graph
    if (collidingFinishline && !player.finished) {
      player.finished = true
      activeLevel.finishLine.mesh.material = ParkourPieces.checkPointActive;
      if (Statistics.checkpointsReached[activeIndex]) {
        Statistics.checkpointsReached[activeIndex]++
      } else {
        Statistics.checkpointsReached[activeIndex] = 1
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
      if (activeLevel.pieces.length - 1 > foundObject.index) {
        next = activeLevel.pieces[foundObject.index + 1]
      } else {
        return ;
      }
      
      player.highestObstacleIndex = activeLevel.pieces.indexOf(foundObject.object)
      player.inputLevels.current = foundObject.object;
      player.inputLevels.next = next
    }

    player.inputLevels.current.mesh.material = ParkourPieces.activeMaterial1;
    player.inputLevels.next.mesh.material = ParkourPieces.activeMaterial2;
  }
}