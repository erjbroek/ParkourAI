import * as THREE from 'three';
import MainCanvas from '../setup/MainCanvas.js';
import CanvasManager from '../setup/CanvasManager.js';

export default class Player {
  public static x: number = 0;

  public static y: number = 2.7;

  public static z: number = 0;

  public height: number = 2.3;

  public radius: number = 1;

  public playerGroup: THREE.Group;

  public constructor() {
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
    CanvasManager.scene.add(this.playerGroup);
  }
}
