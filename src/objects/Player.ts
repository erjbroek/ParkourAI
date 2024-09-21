import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Obstacle from './Obstacle.js';
import Parkour from './Parkour.js';
import KeyListener from '../utilities/KeyListener.js';
import Edit from '../scenes/Edit.js';
import MainCanvas from '../setup/MainCanvas.js';
import ParkourPieces from './ParkourPieces.js';

export default class Player {
  public static x: number = 0;

  public static y: number = 12.7;

  public static z: number = 0;

  public static velocity: { x: number, y: number, z: number } = { x: 0, y: 0, z: 0 };

  public static rotation: number = Math.PI * 1.5;

  public static height: number = 2.3;

  public static radius: number = 1;

  public static mesh: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshLambertMaterial({ color: 0x00aaff }));

  public static playerBody: CANNON.Body;

  public static physicsMaterial: CANNON.Material = new CANNON.Material()

  public spawnPoint: THREE.Vector3 = new THREE.Vector3(0, 5, 20)

  public boundingBox: THREE.Box3;

  public obstacleMaterial: CANNON.Material;

  public onGround: boolean = false;

  private moving: boolean = false

  private forward: THREE.Vector3 = new THREE.Vector3();

  private right: THREE.Vector3 = new THREE.Vector3();

  private jumpStatus: boolean = false;
  
  private jumpBuffer: number = 0.1;

  public constructor() {

    // Player.mesh.position.set(0, 0, 0);
    
    Player.playerBody = new CANNON.Body({ 
      mass: 1, 
      shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)), 
      position: new CANNON.Vec3(0, 5, 20),
      material: Player.physicsMaterial
    })
    
    const platformPlaterContactMaterial = new CANNON.ContactMaterial(Player.physicsMaterial, Obstacle.material, { friction: 0, restitution: 0.0 });
    
    // Player.playerBody.linearDamping = 1;
    Player.playerBody.angularDamping = 0.1;
    Player.mesh.castShadow = true;
    MainCanvas.world.addBody(Player.playerBody);
    MainCanvas.world.addContactMaterial(platformPlaterContactMaterial);
    MainCanvas.scene.add(Player.mesh);

    // testing values
    Player.playerBody.position.set(-28, 15, -360);
    this.spawnPoint.set(16, 5, -162);
    MainCanvas.camera.position.set(-20, 20, -340);
    Parkour.activeLevel = 4

    this.boundingBox = new THREE.Box3().setFromObject(Player.mesh);
  }

  public update(deltaTime: number) {
    this.boundingBox.setFromObject(Player.mesh);
    // this.updateMeshes(Parkour.level[Parkour.activeLevel]);

    Player.rotation = MainCanvas.orbitControls.getAzimuthalAngle();
    MainCanvas.updateLight()
    this.updateMovement(deltaTime);

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
      Player.playerBody.velocity.x += -speed * this.forward.x;
      Player.playerBody.velocity.z += -speed * this.forward.z;
      this.moving = true;
    }
    if (KeyListener.isKeyDown('KeyW')) {
      Player.playerBody.velocity.x += speed * this.forward.x;
      Player.playerBody.velocity.z += speed * this.forward.z;
      this.moving = true;
    }
    if (KeyListener.isKeyDown('KeyA')) {
      Player.playerBody.velocity.x += -speed * this.right.x;
      Player.playerBody.velocity.z += -speed * this.right.z;
      this.moving = true;
    }
    if (KeyListener.isKeyDown('KeyD')) {
      Player.playerBody.velocity.x += speed * this.right.x;
      Player.playerBody.velocity.z += speed * this.right.z;
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
    if (Player.playerBody.position.y < -10) {
      Player.playerBody.position.set(this.spawnPoint.x, this.spawnPoint.y + 8, this.spawnPoint.z);
      Player.playerBody.velocity.set(0, 0, 0);
      Player.playerBody.angularVelocity.set(0, 0, 0);
      Player.playerBody.quaternion.set(0, 0, 0, 1);
      MainCanvas.updateCamera(deltaTime)
    }

    // apply friction when player is not moving
    if (!this.moving && this.onGround) {
      Player.playerBody.velocity.x *= 0.87;
      Player.playerBody.velocity.z *= 0.87;
      Player.playerBody.angularVelocity.y *= 0.95;
    }
    Player.playerBody.velocity.x *= 0.95;
    Player.playerBody.velocity.z *= 0.95;

  }

  public jump() {
    const jumpForce = 14;
    Player.playerBody.velocity.y = jumpForce;
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

  // checks collision between the player and specified levels
  // is used to check if the player can jump and if checkpoint is reached
  public checkCollision(levels: Obstacle[][]): void {
    // Reset onGround flag initially
    this.onGround = false;

    // Loop through each level
    levels.forEach((level) => {
      level.forEach((object) => {
        if (object.isCheckpoint) {
          if (object.boundingBox.intersectsBox(this.boundingBox) && object.mesh.material != ParkourPieces.checkPointActive) {
            if (Parkour.level[Parkour.activeLevel + 1]) {
              Parkour.activeLevel++;
            }
            // Turn the checkpoint green and update spawnpoint of player
            object.mesh.material = ParkourPieces.checkPointActive;
            const objectHeight = object.boundingBox.max.y - object.boundingBox.min.y;
            this.spawnPoint = new THREE.Vector3(
              object.mesh.position.x,
              object.mesh.position.y - objectHeight / 2,
              object.mesh.position.z
            );
          }
        } else {
          const obstacleTopY = object.boundingBox.max.y;
          const playerMinY = this.boundingBox.min.y;
  
          // Player is touching ground, applies friction and enables flag
          if (object.boundingBox.intersectsBox(this.boundingBox) && playerMinY >= obstacleTopY - 0.1) {
            // makes sure player doesnt start spinning fastly when continuously jumping
            Player.playerBody.angularVelocity.y *= 0.5;
            Player.playerBody.angularVelocity.x *= 0.5;
            Player.playerBody.angularVelocity.z *= 0.5;
            this.onGround = true;  // Set onGround to true if any collision places player on ground
          }
        }
      });
    });
  }
}
