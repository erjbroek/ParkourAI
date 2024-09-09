import * as THREE from 'three';
import MainCanvas from '../setup/mainCanvas.js';
import Obstacle from './Obstacle.js';
import Parkour from './Parkour.js';

export default class Player {
  public static x: number = 0;

  public static y: number = 12.7;

  public static z: number = 0;

  public static velocity: { x: number, y: number, z: number } = { x: 0, y: 0, z: 0 };

  public static rotation: number = Math.PI * 1.5;

  public height: number = 2.3;

  public radius: number = 1;

  public playerGroup: THREE.Group;

  public boundingBox: THREE.Box3;

  public constructor() {
    this.playerGroup = new THREE.Group();
    this.boundingBox = new THREE.Box3().setFromObject(this.playerGroup);

    this.createPlayer();
  }

  private createPlayer(): void {
    const cylinderGeometry = new THREE.CylinderGeometry(this.radius, this.radius, this.height, 32);
    const sphereGeometry = new THREE.SphereGeometry(this.radius, 32, 32);
    const material = new THREE.MeshLambertMaterial({ color: 0x00aaff });
    const faceMaterial = new THREE.MeshLambertMaterial({ color: 0xaaaaff });

    const playerCylinder = new THREE.Mesh(cylinderGeometry, material);
    const playerSphere1 = new THREE.Mesh(sphereGeometry, material);
    const playerSphere2 = new THREE.Mesh(sphereGeometry, material);
    const playerFace = new THREE.Mesh(sphereGeometry, faceMaterial);

    playerCylinder.position.set(0, 0, 0);
    playerSphere1.position.set(0, -this.height / 2, 0);
    playerSphere2.position.set(0, this.height / 2, 0);
    playerFace.position.set(0, 0.6, this.radius / 3);

    this.playerGroup.add(playerCylinder);
    this.playerGroup.add(playerSphere1);
    this.playerGroup.add(playerSphere2);
    this.playerGroup.add(playerFace);

    this.playerGroup.position.set(Player.x, Player.y, Player.z);
    MainCanvas.scene.add(this.playerGroup);
  }

  public getCoordinates(): { x: number, y: number, z: number } {
    return { x: Player.x, y: Player.y, z: Player.z };
  }

  public update(deltaTime: number) {
    console.log(MainCanvas.orbitControls.getAzimuthalAngle())
    
    const speed = 10; // Adjust the speed factor as needed
    Player.rotation = MainCanvas.orbitControls.getAzimuthalAngle();
    Player.velocity.x = -Math.sin(Player.rotation) * speed;
    Player.velocity.z = -Math.cos(Player.rotation) * speed;

    Player.x += Player.velocity.x * deltaTime;
    Player.y += Player.velocity.y * deltaTime;
    Player.z += Player.velocity.z * deltaTime;


    // gravity
    Player.velocity.y -= MainCanvas.gravityConstant * deltaTime * 3
    Player.y += Player.velocity.y * deltaTime;

    this.playerGroup.position.set(Player.x, Player.y, Player.z);
    this.playerGroup.rotation.y = Player.rotation - Math.PI;
  }
}
