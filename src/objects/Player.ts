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

  public rotation: number = Math.PI * 1.5;

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

  public constructor(index: number) {
    this.playerBody = new CANNON.Body({ 
      mass: 1, 
      shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)), 
      position: new CANNON.Vec3(0 + index * 2, this.y, this.z), // Offset positions based on index
      material: this.physicsMaterial
    });
    
    const platformPlaterContactMaterial = new CANNON.ContactMaterial(this.physicsMaterial, Obstacle.material, { friction: 0, restitution: 0 });
    
    // Player.playerBody.linearDamping = 1;
    this.playerBody.angularDamping;
    this.mesh.castShadow = true;
    MainCanvas.world.addBody(this.playerBody);
    MainCanvas.world.addContactMaterial(platformPlaterContactMaterial);
    MainCanvas.scene.add(this.mesh);

    // testing values
    // Player.playerBody.position.set(338, 60, -68);
    // this.spawnPoint.set(116, 15, -296);
    // MainCanvas.camera.position.set(326, 68, -88);
    // Parkour.activeLevel = 9

    this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
  }

  public update(deltaTime: number) {
    console.log(`Player Position Before Update: ${this.playerBody.position}`);
    
    this.boundingBox.setFromObject(this.mesh);
    this.updateMovement(deltaTime);
    
    console.log(`Player Position After Update: ${this.playerBody.position}`);

  }

  public updateMovement(deltaTime: number) {
    // calculatesplayer direction based on camera azimuth
    this.forward = new THREE.Vector3();
    MainCanvas.camera.getWorldDirection(this.forward);
    this.forward.y = 0;
    this.forward.normalize();
    this.right = new THREE.Vector3();
    this.right.crossVectors(this.forward, MainCanvas.camera.up).normalize();
    
    // player movement based on inputs
    const speed = 0.8;
    this.moving = false;
    if (KeyListener.isKeyDown('KeyS')) {
      this.playerBody.velocity.x += -speed * this.forward.x;
      this.playerBody.velocity.z += -speed * this.forward.z;
      this.moving = true;
    }
    if (KeyListener.isKeyDown('KeyW')) {
      this.playerBody.velocity.x += speed * this.forward.x;
      this.playerBody.velocity.z += speed * this.forward.z;
      this.moving = true;
    }
    if (KeyListener.isKeyDown('KeyA')) {
      this.playerBody.velocity.x += -speed * this.right.x;
      this.playerBody.velocity.z += -speed * this.right.z;
      this.moving = true;
    }
    if (KeyListener.isKeyDown('KeyD')) {
      this.playerBody.velocity.x += speed * this.right.x;
      this.playerBody.velocity.z += speed * this.right.z;
      this.moving = true;
    }
    if (KeyListener.isKeyDown('Space')) {
      this.jumpBuffer = 0.1;
      this.jumpStatus = true;
    }

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

  }

  public jump() {
    const jumpForce = 14;
    this.playerBody.velocity.y = jumpForce;
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
