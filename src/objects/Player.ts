import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Obstacle from './Obstacle.js';
import Parkour from './Parkour.js';
import KeyListener from '../utilities/KeyListener.js';
import Edit from '../scenes/Edit.js';
import MainCanvas from '../setup/MainCanvas.js';
import ParkourPieces from './ParkourPieces.js';
import Game from '../scenes/Game.js';
import * as neat from 'neataptic';


const PLAYER_GROUP = 1 << 0; // 0001
const OBSTACLE_GROUP = 1 << 1; // 0010

const Neat = neat.Neat;
const Methods = neat.methods;

export default class Player {
  public rotation: THREE.Vector3 = new THREE.Vector3(0, Math.PI * 1.5, 0);

  public mesh: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshLambertMaterial({ color: 0x00aaff }));

  public physicsMaterial: CANNON.Material = new CANNON.Material();

  public playerBody: CANNON.Body;

  public spawnPoint: THREE.Vector3 = new THREE.Vector3(0, 0.5, 20)

  public boundingBox: THREE.Box3;

  public onGround: boolean = false;

  public currentLevel: number = 0;

  public index: number = 0;

  public brain: any;

  public inputLevels: { current: Obstacle, next: Obstacle } = { current: Parkour.levels[0][0], next: Parkour.levels[0][1] };

  public obstacleCoordinations: { current: THREE.Vector3, next: THREE.Vector3 } = { current: new THREE.Vector3(), next: new THREE.Vector3() };

  public inputValues: number[] = []

  public alive: boolean = true;

  public speedTimer: number = 0;

  public deathTime: number = 3;

  public deathTimer: number = 8;

  public highestObstacle: Obstacle = Parkour.levels[0][0];

  public highestObstacleIndex: number = 0;

  public ai: boolean;

  public userFitness: number = 0;

  public currentPlatform: number = 0;

  public constructor(index: number, ai: boolean, level: number = 0) {
    this.ai = ai;
    this.index = index;
    if (this.index == 0) {
      this.mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshLambertMaterial({ color: 0xaaffff }));
    }

    // used to set player spawnpoint

    if (level) {
      this.playerBody = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
        position: new CANNON.Vec3(Parkour.levels[level][Parkour.levels[level].length - 1].mesh.position.x, Parkour.levels[level][Parkour.levels[level].length - 1].mesh.position.y + 4, Parkour.levels[level][Parkour.levels[level].length - 1].mesh.position.z),
        material: this.physicsMaterial,
        collisionFilterGroup: PLAYER_GROUP, // Player belongs to PLAYER_GROUP
        collisionFilterMask: OBSTACLE_GROUP, // Player can only collide with OBSTACLE_GROUP
      });
      this.currentLevel = level;
      MainCanvas.camera.position.set(Parkour.levels[level][Parkour.levels[level].length - 1].mesh.position.x + 4, Parkour.levels[level][Parkour.levels[level].length - 1].mesh.position.y + 10, Parkour.levels[level][Parkour.levels[level].length - 1].mesh.position.z + 15);
    } else {
      // sets it to start
      this.playerBody = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
        position: new CANNON.Vec3(0, 1.5, 20),
        material: this.physicsMaterial,
        collisionFilterGroup: PLAYER_GROUP, // Player belongs to PLAYER_GROUP
        collisionFilterMask: OBSTACLE_GROUP, // Player can only collide with OBSTACLE_GROUP
      });
    }

    const platformPlaterContactMaterial = new CANNON.ContactMaterial(this.physicsMaterial, Obstacle.material, { friction: 0, restitution: 0 });
    this.mesh.castShadow = true;
    MainCanvas.world.addBody(this.playerBody);
    MainCanvas.world.addContactMaterial(platformPlaterContactMaterial);
    MainCanvas.scene.add(this.mesh);
    
    this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
  }

  /**
   * updates the player movement and input values for nn
   * 
   * @param deltaTime deltatime since last frame
   */
  public update(deltaTime: number) {
    if (this.ai) {
      if (this.deathTimer > 0) {
        this.deathTimer -= deltaTime;
      } else {
        this.killPlayer()
      }
    }

    const currentObstacle = this.inputLevels.current.boundingBox;
    const nextObstacle = this.inputLevels.next.boundingBox;

    this.obstacleCoordinations.current = new THREE.Vector3();
    currentObstacle.clampPoint(nextObstacle.getCenter(new THREE.Vector3()), this.obstacleCoordinations.current);
    this.obstacleCoordinations.next = new THREE.Vector3();
    nextObstacle.clampPoint(currentObstacle.getCenter(new THREE.Vector3()), this.obstacleCoordinations.next);

    const playerPosition = new THREE.Vector3(Math.round(this.playerBody.position.x * 1000) / 1000, Math.round((this.playerBody.position.y - 1.5) * 1000) / 1000, Math.round(this.playerBody.position.z * 1000) / 1000)
    this.obstacleCoordinations.next.subVectors(this.obstacleCoordinations.next, playerPosition)
    this.obstacleCoordinations.current.subVectors(this.obstacleCoordinations.current, playerPosition)
    const playerVelocity = Math.abs(this.playerBody.velocity.x) + Math.abs(this.playerBody.velocity.y) + Math.abs(this.playerBody.velocity.z)  

    const decimals = 3;
    const inputValues = [
      Math.round(this.obstacleCoordinations.current.x * 10 ** decimals) / 10 ** decimals,
      Math.round(this.obstacleCoordinations.current.y * 10 ** decimals) / 10 ** decimals,
      Math.round(this.obstacleCoordinations.current.z * 10 ** decimals) / 10 ** decimals,
      this.obstacleCoordinations.next.x,
      this.obstacleCoordinations.next.y,
      this.obstacleCoordinations.next.z,
      Math.round(playerVelocity * 10 ** decimals) / 10 ** decimals / 10
    ];
    
    const extremes: { max: number, min: number } = {
      max: Math.max(...inputValues),
      min: Math.min(...inputValues)
    };
    
    const normalizedValues = inputValues.map(value => {
      if (extremes.max === extremes.min) {
        return 0;
      }
      return 2 * (value - extremes.min) / (extremes.max - extremes.min) - 1;
    });
    
    this.inputValues = [...normalizedValues, this.onGround ? 1 : 0];
    
    this.boundingBox.setFromObject(this.mesh);
    this.updateMovement(deltaTime);
  }

  public updateMovement(deltaTime: number) {
    if (this.ai) {
      const output = this.brain.activate(this.inputValues);
      if (this.index === 0 ) {
        // console.log(output)
      }
      const outputForwards = output[0];
      const outputBackwards = output[1];
      const outputLeft = output[2];  
      const outputRight = output[3]; 
      const outputJump = output[4];
      

        // this.moveForwardBackward(outputZ);
        this.moveForward(outputForwards)
        this.moveBackward(outputBackwards)


        this.moveLeft(outputLeft);

        this.moveRight(outputRight);

      if (outputJump > 0.5) {
        if (this.onGround) {
          this.jump()
        }
      }
    }
      
    // if player falls, reset position to last reached checkpoint
    if (this.playerBody.position.y < -10) {
      this.killPlayer()
    }

    // apply friction when player is not moving
    if (this.onGround) {
      this.playerBody.velocity.x *= 0.93;
      this.playerBody.velocity.z *= 0.93;
      // this.playerBody.angularVelocity.y *= 0.95;
    }
    this.playerBody.velocity.x *= 0.97;
    this.playerBody.velocity.z *= 0.97;

    // needs to be fixed someday, since it causes non-realistic physics/ collisions
    this.playerBody.quaternion.setFromEuler(0, this.rotation.y, 0);
    
  }

  public killPlayer() {
    this.alive = false;
    MainCanvas.world.removeBody(this.playerBody)
    MainCanvas.scene.remove(this.mesh)
  }

  public calculateDistance(): number {
    const checkpoint = Parkour.levels[this.currentLevel][Parkour.levels[this.currentLevel].length - 1];

    const spawnPoint = this.spawnPoint;

    const maxDistance = Math.sqrt(
      (spawnPoint.x - checkpoint.mesh.position.x) ** 2 +
      (spawnPoint.y - checkpoint.mesh.position.y) ** 2 +
      (spawnPoint.z - checkpoint.mesh.position.z) ** 2
    );
    const currentDistance = Math.sqrt(
      (this.playerBody.position.x - checkpoint.mesh.position.x) ** 2 +
      (this.playerBody.position.y - checkpoint.mesh.position.y) ** 2 +
      (this.playerBody.position.z - checkpoint.mesh.position.z) ** 2
    );

    const distanceFitness = currentDistance / maxDistance;

    return (1 - distanceFitness) * 100;
  }

  /**
   * calculates the percentage of the distance the player is to the next obstacle
   * 
   * @returns percentage that player has reached to the next jump from the current
   */
  public calculateObstacleDistance(): number {
    // will be used for the starting point, 0% distance
    const current = this.inputLevels.current.boundingBox;

    // will be used for the end point, 100% distance
    const next = this.inputLevels.next.boundingBox;
    

    
    // this first finds the nearest point on the next platform to the current platform
    const currentCenter = current.getCenter(new THREE.Vector3());
    const nextPosition = new THREE.Vector3();
    next.clampPoint(currentCenter, nextPosition);
    
    //then it gets the point that is furthest away from the next jump
    const directionVector = new THREE.Vector3();
    directionVector.subVectors(nextPosition, currentCenter);
    directionVector.multiplyScalar(-2);
    const currentPosition = new THREE.Vector3();
    currentPosition.addVectors(nextPosition, directionVector);

    const maxDistance = Math.sqrt(
      (currentPosition.x - nextPosition.x) ** 2 +
      (currentPosition.y - nextPosition.y) ** 2 +
      (currentPosition.z - nextPosition.z) ** 2
    );
    
    const currentDistance = Math.sqrt(
      (this.playerBody.position.x - nextPosition.x) ** 2 +
      (this.playerBody.position.y - nextPosition.y) ** 2 +
      (this.playerBody.position.z - nextPosition.z) ** 2
    );

    return (1 - currentDistance / maxDistance);
  }

  /**
   * the fitness of the player is based on progress in the course
   * 
   * @returns the fitness of the player
   */
  public calculateFitness(): void {
    if (this.ai) {
      this.brain.score = 0;
      
      // progress in level
      this.brain.score += this.currentLevel * 40
      this.brain.score += 25 * this.calculateObstacleDistance() + this.highestObstacleIndex * 25
    } else {
      this.userFitness = 0;
      
      // progress in level
      this.userFitness += this.currentLevel * 30
      this.userFitness += 25 * this.calculateObstacleDistance() + this.highestObstacleIndex * 25
    }
  }

  public jump() {
    const jumpForce = 14;
    this.playerBody.position.y += 0.01;
    this.playerBody.velocity.y = jumpForce;
  }

  /**
   * moves player left or right based on player rotation
   * 
   * @param amount is the multiplier for the speed of the player between -1 and 1
   */
  public moveLeft(amount: number) {
    const speed = 4;

    this.playerBody.velocity.x += amount * -speed;
    // this.playerBody.velocity.z += amount * -speed;
    this.normalizeVelocity();
  }

    /**
   * moves player left or right based on player rotation
   * 
   * @param amount is the multiplier for the speed of the player between -1 and 1
   */
    public moveRight(amount: number) {
      const speed = 4;
  
      this.playerBody.velocity.x -= amount * -speed;
      // this.playerBody.velocity.z += amount * -speed;
      this.normalizeVelocity();
    }

    public moveForward(amount: number) {
      const speed = 4;

      this.playerBody.velocity.z += amount * speed;
      this.normalizeVelocity();
    }

    public moveBackward(amount: number) {
      const speed = 4;

      this.playerBody.velocity.z -= amount * speed;
      this.normalizeVelocity();
    }

  /**
   * moves player forwards or backwards based on player rotation
   * 
   * @param amount is the multiplier for the speed of the player between -1 and 1
   */
  public moveForwardBackward(amount: number) {
    const speed = 4;

    // this.playerBody.velocity.x += amount * speed;
    this.playerBody.velocity.z -= amount * -speed;
    this.normalizeVelocity();
  }

  /**
   * normalizes player velocity to prevent player from moving faster than max speed
   * this is the case when the player is moving diagonally relative to player rotation
   */
  private normalizeVelocity() {
    const maxSpeed = 16;
    const speed = Math.sqrt(
      this.playerBody.velocity.x * this.playerBody.velocity.x +
      this.playerBody.velocity.z * this.playerBody.velocity.z
    );

    if (speed > maxSpeed) {
      const scale = maxSpeed / speed;
      this.playerBody.velocity.x *= scale;
      this.playerBody.velocity.z *= scale;
    }
  }

  /**
   * Updates the position of the physics body to match position of mesh
   */
  public updateMeshes(obstacles: Obstacle[]): void {
    obstacles.forEach((obstacle) => {
      obstacle.mesh.position.copy(obstacle.platformBody.position);
      obstacle.mesh.quaternion.copy(obstacle.platformBody.quaternion);
    });
  }
}