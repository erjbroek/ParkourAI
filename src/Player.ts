import * as THREE from 'three';
import GameSetup from './GameSetup.js';

export default class Player {
  public posX: number;
  public posY: number;
  public posZ: number;
  public height: number;
  public radius: number;
  public playerGroup: THREE.Group;

  constructor(posX = 0, posY = 2, posZ = 0, height = 1.5, radius = 1) {
    this.posX = posX;
    this.posY = posY;
    this.posZ = posZ;
    this.height = height;
    this.radius = radius;
    this.playerGroup = new THREE.Group();
    this.createPlayer();
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

    this.playerGroup.position.set(this.posX, this.posY, this.posZ);
    GameSetup.scene.add(this.playerGroup);
  }
}
