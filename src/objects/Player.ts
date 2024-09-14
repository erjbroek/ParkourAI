import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import MainCanvas from '../setup/MainCanvas.js';
import Obstacle from './Obstacle.js';
import Parkour from './Parkour.js';
import KeyListener from '../utilities/KeyListener.js';
import Edit from '../scenes/Edit.js';

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
    
    // this.playerGroup.position.set(Player.x4, Player.y, Player.z);
    Player.playerBody.linearDamping = 0.4;
    Player.playerBody.angularDamping = 0.1;
    MainCanvas.world.addBody(Player.playerBody);
    MainCanvas.world.addContactMaterial(platformPlaterContactMaterial);
    // Edit.transformControls.attach(Player.mesh);
    MainCanvas.scene.add(Player.mesh);

  }

  public update(deltaTime: number) {
    // console.log(MainCanvas.orbitControls.getAzimuthalAngle())

    const speed = 10; // Adjust the speed factor as needed
    Player.rotation = MainCanvas.orbitControls.getAzimuthalAngle();

    if (KeyListener.isKeyDown('KeyW')) {
      Player.playerBody.velocity.z = -speed;  // Move forward
    }
    if (KeyListener.isKeyDown('KeyS')) {
      Player.playerBody.velocity.z = speed;   // Move backward
    }
    if (KeyListener.isKeyDown('KeyA')) {
      Player.playerBody.velocity.x = -speed;  // Move left
    }
    if (KeyListener.isKeyDown('KeyD')) {
      Player.playerBody.velocity.x = speed;   // Move right
    }

    this.updateMeshes(Parkour.level1);
  }

  public updateMeshes(obstacles: Obstacle[]): void {
    obstacles.forEach((obstacle) => {
      obstacle.mesh.position.copy(obstacle.platformBody.position);
      obstacle.mesh.quaternion.copy(obstacle.platformBody.quaternion);
    });
  }
}
