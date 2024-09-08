import * as THREE from 'three';
import GameSetup from '../setup/GameSetup.js';
import SceneManager from '../utilities/SceneManager.js';

export default class Player {
  public static x: number;

  public static y: number;

  public static z: number;

  public height: number;

  public radius: number;

  public playerGroup: THREE.Group;

  public constructor(posX = 0, posY = 2.3, posZ = 0, height = 1.5, radius = 1) {
    Player.x = posX;
    Player.y = posY;
    Player.z = posZ;
    this.height = height;
    this.radius = radius;
    this.playerGroup = new THREE.Group();
    this.createPlayer();
  }

  public getCoordinates(): { x: number, y: number, z: number } {
    return { x: Player.x, y: Player.y, z: Player.z };
  }

  public update(deltaTime: number) {

  }

  private createPlayer(): void {
    const cylinderGeometry = new THREE.CylinderGeometry(this.radius, this.radius, this.height, 32);
    const sphereGeometry = new THREE.SphereGeometry(this.radius, 32, 32);
    const material = new THREE.MeshLambertMaterial({ color: 0x00aaff });

    const playerCylinder = new THREE.Mesh(cylinderGeometry, material);
    const playerSphere1 = new THREE.Mesh(sphereGeometry, material);
    const playerSphere2 = new THREE.Mesh(sphereGeometry, material);

    playerCylinder.position.set(0, 0, 0);
    playerSphere1.position.set(0, -this.height / 2, 0);
    playerSphere2.position.set(0, this.height / 2, 0);

    this.playerGroup.add(playerCylinder);
    this.playerGroup.add(playerSphere1);
    this.playerGroup.add(playerSphere2);

    this.playerGroup.position.set(Player.x, Player.y, Player.z);
    SceneManager.scene.add(this.playerGroup);
  }
}
