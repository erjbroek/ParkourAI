import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Obstacle from './Obstacle.js';
import Parkour from './Parkour.js';
import KeyListener from '../utilities/KeyListener.js';
import Edit from '../scenes/Edit.js';
import MainCanvas from '../setup/MainCanvas.js';
import ParkourPieces from './ParkourPieces.js';
import Game from '../scenes/Game.js';

export default class Player {
  public x: number = 0;

  public y: number = 5;

  public z: number = 20;

  public velocity: { x: number, y: number, z: number } = { x: 0, y: 0, z: 0 };

  public rotation: THREE.Vector3 = new THREE.Vector3(0, Math.PI * 1.5, 0);

  public height: number = 2.3;

  public radius: number = 1;

  public mesh: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshLambertMaterial({ color: 0x00aaff }));

  public physicsMaterial: CANNON.Material = new CANNON.Material();

  public playerBody: CANNON.Body;

  public spawnPoint: THREE.Vector3 = new THREE.Vector3(0, 5, 20)

  public boundingBox: THREE.Box3;

  public obstacleMaterial: CANNON.Material;

  public onGround: boolean = false;

  private moving: boolean = false

  private forward: THREE.Vector3 = new THREE.Vector3();

  private right: THREE.Vector3 = new THREE.Vector3();

  private jumpStatus: boolean = false;

  private jumpBuffer: number = 0.1;

  public currentLevel: number = 0;

  public constructor(index: number) {
    this.playerBody = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
      position: new CANNON.Vec3(this.x + index * 3, this.y + index * 3, this.z), // Offset positions based on index
      material: this.physicsMaterial
    });

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

    this.forward.set(Math.sin(this.rotation.y), 0, Math.cos(this.rotation.y)).normalize();
    this.right.set(Math.sin(this.rotation.y + Math.PI / 2), 0, Math.cos(this.rotation.y + Math.PI / 2)).normalize();

    // player movement based on inputs
    const speed = 0.8;
    this.moving = false;
    if (KeyListener.isKeyDown('KeyS')) {
      this.moveForwardBackward(-1);
      this.moving = true;
    }
    if (KeyListener.isKeyDown('KeyW')) {
      this.moveForwardBackward(1);
      this.moving = true;
    }
    if (KeyListener.isKeyDown('KeyA')) {
      this.moveLeftRight(-1);
      this.moving = true;
    }
    if (KeyListener.isKeyDown('KeyD')) {
      this.moveLeftRight(1);
      this.moving = true;
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
    if (!this.moving && this.onGround) {
      this.playerBody.velocity.x *= 0.87;
      this.playerBody.velocity.z *= 0.87;
      this.playerBody.angularVelocity.y *= 0.95;
    }
    this.playerBody.velocity.x *= 0.95;
    this.playerBody.velocity.z *= 0.95;
    this.playerBody.quaternion.setFromEuler(0, this.rotation.y, 0);
  }

  public jump() {
    const jumpForce = 14;
    this.playerBody.velocity.y = jumpForce;
  }

  /**
   * moves player left or right based on player rotation
   * 
   * @param amount is the multiplier for the speed of the player between -1 and 1
   */
  public moveLeftRight(amount: number) {
    const speed = 0.8;

    this.playerBody.velocity.x += amount * -speed * this.right.x;
    this.playerBody.velocity.z += amount * -speed * this.right.z;
    this.normalizeVelocity();
  }

  /**
   * moves player forwards or backwards based on player rotation
   * 
   * @param amount is the multiplier for the speed of the player between -1 and 1
   */
  public moveForwardBackward(amount: number) {
    const speed = 0.8;

    this.playerBody.velocity.x += amount * speed * this.forward.x;
    this.playerBody.velocity.z += amount * speed * this.forward.z;
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