import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import Obstacle from './Obstacle.js';
import Parkour from './Parkour.js';
import KeyListener from '../utilities/KeyListener.js';
import Edit from '../scenes/Edit.js';
import MainCanvas from '../setup/MainCanvas.js';

export default class Player {
  public static x: number = 0;

  public static y: number = 12.7;

  public static z: number = 0;

  public static velocity: { x: number, y: number, z: number } = { x: 0, y: 0, z: 0 };

  public static rotation: number = Math.PI * 1.5;

  public static height: number = 2.3;

  public static radius: number = 1;

  public static mesh: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 2.3, 1), new THREE.MeshLambertMaterial({ color: 0x00aaff }));

  public static playerBody: CANNON.Body;

  public static physicsMaterial: CANNON.Material = new CANNON.Material()
  
  public obstacleMaterial: CANNON.Material;


  public constructor() {
    Player.mesh.position.set(0, 2, 0);
    
    Player.playerBody = new CANNON.Body({ 
      mass: 1, 
      shape: new CANNON.Box(new CANNON.Vec3(0.5, 1.15, 0.5)), 
      position: new CANNON.Vec3(0, 5, 0),
      material: Player.physicsMaterial
    })
    
    const platformPlaterContactMaterial = new CANNON.ContactMaterial(Player.physicsMaterial, Obstacle.material, { friction: 0.0, restitution: 0.0 });
    
    Player.playerBody.linearDamping = 0.4;
    Player.playerBody.angularDamping = 0.1;
    Player.mesh.castShadow = true;
    MainCanvas.world.addBody(Player.playerBody);
    MainCanvas.world.addContactMaterial(platformPlaterContactMaterial);
    MainCanvas.scene.add(Player.mesh);

  }

  public update(deltaTime: number) {
    const speed = 0.5;
    Player.rotation = MainCanvas.orbitControls.getAzimuthalAngle();
    MainCanvas.updateLightAndCameraPosition()

    const forward = new THREE.Vector3();
    MainCanvas.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, MainCanvas.camera.up).normalize();

    if (KeyListener.isKeyDown('KeyS')) {
      Player.playerBody.velocity.x += -speed * forward.x;
      Player.playerBody.velocity.z += -speed * forward.z;  // Move backwards
    }
    if (KeyListener.isKeyDown('KeyW')) {
      Player.playerBody.velocity.x += speed * forward.x;
      Player.playerBody.velocity.z += speed * forward.z;   // Move forwards
    }
    if (KeyListener.isKeyDown('KeyA')) {
      Player.playerBody.velocity.x += -speed * right.x;
      Player.playerBody.velocity.z += -speed * right.z;  // Move left
    }
    if (KeyListener.isKeyDown('KeyD')) {
      Player.playerBody.velocity.x += speed * right.x;
      Player.playerBody.velocity.z += speed * right.z;   // Move right
    }

    
    const maxSpeed = 20;
    
    // Clamp the velocity in the x direction
    Player.playerBody.velocity.x = Math.max(Math.min(Player.playerBody.velocity.x, maxSpeed), -maxSpeed);
    Player.playerBody.velocity.z = Math.max(Math.min(Player.playerBody.velocity.z, maxSpeed), -maxSpeed);
    
    if (Player.playerBody.position.y < -10) {
      Player.playerBody.position.set(0, 10, 0);
      Player.playerBody.velocity.set(0, 0, 0);
      MainCanvas.updateCamera(deltaTime)
    }
    this.updateMeshes(Parkour.level1);
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
