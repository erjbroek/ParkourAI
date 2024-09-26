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

  public spawnPoint: THREE.Vector3 = new THREE.Vector3(0, 5, 20)

  public boundingBox: THREE.Box3;

  public obstacleMaterial: CANNON.Material;

  public onGround: boolean = false;

  private jumpStatus: boolean = false;

  private jumpBuffer: number = 0.1;

  public currentLevel: number = 0;

  public index: number = 0;

  public brain: any;

  public inputLevels: {current: Obstacle, next: Obstacle} = {current: Parkour.levels[0][0], next: Parkour.levels[0][1]};

  public inputValues: {current: THREE.Vector3, next: THREE.Vector3} = {current: new THREE.Vector3(), next: new THREE.Vector3()};

  public constructor(index: number) {
    this.index = index;
    if (this.index == 0) {
      this.mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshLambertMaterial({ color: 0xaaffff }));
    }
    
    // used to set player spawnpoint
    let level: number | null;
    level = 0

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
        position: new CANNON.Vec3(0 + index * 3, 1, 20),
        material: this.physicsMaterial,
        collisionFilterGroup: PLAYER_GROUP, // Player belongs to PLAYER_GROUP
        collisionFilterMask: OBSTACLE_GROUP, // Player can only collide with OBSTACLE_GROUP
      });
    }

    const platformPlaterContactMaterial = new CANNON.ContactMaterial(this.physicsMaterial, Obstacle.material, { friction: 0, restitution: 0 });

    // Player.playerBody.linearDamping = 1;
    this.playerBody.angularDamping;
    this.mesh.castShadow = true;
    MainCanvas.world.addBody(this.playerBody);
    MainCanvas.world.addContactMaterial(platformPlaterContactMaterial);
    MainCanvas.scene.add(this.mesh);
    this.rotation.y = Math.PI;

    // testing values
    // Player.playerBody.position.set(338, 60, -68);
    // this.spawnPoint.set(116, 15, -296);
    // MainCanvas.camera.position.set(326, 68, -88);
    // Parkour.activeLevel = 9

    this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
  }

  public update(deltaTime: number) {
    const currentObstacle = this.inputLevels.current.boundingBox;
    const nextObstacle = this.inputLevels.next.boundingBox;

    this.inputValues.current = new THREE.Vector3();
    currentObstacle.clampPoint(nextObstacle.getCenter(new THREE.Vector3()), this.inputValues.current);
    this.inputValues.next = new THREE.Vector3();
    nextObstacle.clampPoint(currentObstacle.getCenter(new THREE.Vector3()), this.inputValues.next);

    this.boundingBox.setFromObject(this.mesh);
    this.updateMovement(deltaTime);
  }

  public updateMovement(deltaTime: number) {

    // calculatesplayer direction based on camera azimuth
    const rotationSpeed = 2.5;
    if (KeyListener.isKeyDown('ArrowLeft')) {
      this.rotation.y += rotationSpeed * deltaTime;
    }
    if (KeyListener.isKeyDown('ArrowRight')) {
      this.rotation.y -= rotationSpeed * deltaTime;
    }

    // player movement based on inputs
    if (KeyListener.isKeyDown('KeyS')) {
      this.moveForwardBackward(-1);
    }
    if (KeyListener.isKeyDown('KeyW')) {
      this.moveForwardBackward(1);
    }
    if (KeyListener.isKeyDown('KeyA')) {
      this.moveLeftRight(-1);
    }
    if (KeyListener.isKeyDown('KeyD')) {
      this.moveLeftRight(1);
    }
    if (KeyListener.isKeyDown('ArrowLeft')) {
      this.rotate(1);
    }
    if (KeyListener.isKeyDown('ArrowRight')) {
      this.rotate(-1);
    }
    if (KeyListener.isKeyDown('Space')) {
      this.jumpBuffer = 0.1;
      this.jumpStatus = true;
    }

    // jumpbuffer allows for jump to be triggered even when the key is pressed a little too early
    this.jumpBuffer -= deltaTime;
    if (this.jumpStatus && this.jumpBuffer > 0 && this.onGround) {
      this.jump();
      this.jumpStatus = false;
    }

    // if player falls, reset position to last reached checkpoint
    if (this.playerBody.position.y < -10) {
      this.playerBody.position.set(this.spawnPoint.x, this.spawnPoint.y + 8, this.spawnPoint.z);
      this.playerBody.velocity.set(0, 0, 0);
      this.playerBody.angularVelocity.set(0, 0, 0);
      this.playerBody.quaternion.set(0, 0, 0, 1);
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

    if (this.index == 0) {
      this.calculateDistance()
      this.calculateFitness()
    }
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
   * the fitness of the player is based on progress in the course
   * 
   * @returns the fitness of the player
   */
  public calculateFitness(): number {
    let fitness = 0;
    // progress in level
    fitness += this.calculateDistance()
    fitness += this.currentLevel * 100

    // console.log(fitness)
    return fitness;
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
  public moveLeftRight(amount: number) {
    const speed = 2;

    this.playerBody.velocity.x -= amount * -speed;
    // this.playerBody.velocity.z += amount * -speed;
    this.normalizeVelocity();
  }

  /**
   * moves player forwards or backwards based on player rotation
   * 
   * @param amount is the multiplier for the speed of the player between -1 and 1
   */
  public moveForwardBackward(amount: number) {
    const speed = 2;

    // this.playerBody.velocity.x += amount * speed;
    this.playerBody.velocity.z -= amount * speed;
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

  public rotate(amount: number) {
    const speed: number = 0.07;
    this.rotation.y += amount * speed;
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