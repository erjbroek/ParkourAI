import { platform } from 'os';
import Obstacle from './Obstacle.js';
import * as THREE from 'three';
import MainCanvas from '../setup/mainCanvas.js';

export default class Parkour {
  public static level1: Obstacle[] = [];

  public static level2: Obstacle[] = [];

  public static level3: Obstacle[] = [];

  public static level4: Obstacle[] = [];

  // used to display all different objects in the parkour
  public objectArray: Obstacle[] = [];

  public material: THREE.MeshLambertMaterial = new THREE.MeshLambertMaterial({ color: 0xccffcc });

  public normalBlock: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 4), this.material);

  public longBlock: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 12), this.material);

  public bridge: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 20), this.material);

  public platformBlock: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(32, 1, 16), this.material);

  public checkPoint: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(32, 1, 6), this.material)

  public constructor() {

  }

  public generateParkour(): void {
    const startingPlatform = new Obstacle(this.platformBlock.clone(), 0, 0, 0, 0, 0, 0);
    const bridge = new Obstacle(this.bridge.clone(), 0, 0, -18, 0, 0, 0);
    const obstacle1 = new Obstacle(this.normalBlock.clone(), -4, 0, -26);
    const obstacle2 = new Obstacle(this.normalBlock.clone(), -8, 0, -26);
    const bridge2 = new Obstacle(this.bridge.clone(), -8, 0, -36, 0, 0, 0);
    const checkpoint1 = new Obstacle(this.checkPoint.clone(), -8, 0, -49, 0, 0, 0);
    
    // this.objectArray.push(
    //   new Obstacle(this.normalBlock.clone(), 30, 30, 30),
    //   new Obstacle(this.longBlock.clone(), 70, 30, 30),
    //   new Obstacle(this.bridge.clone(), 110, 30, 30),
    //   new Obstacle(this.platformBlock.clone(), 150, 30, 30),
    //   new Obstacle(this.checkPoint.clone(), 190, 30, 30)
    //   );

    Parkour.level1.push(startingPlatform, bridge, obstacle1, obstacle2, bridge2, checkpoint1);

    this.renderParkour()
  }

  public renderParkour(): void {
    Parkour.level1.forEach((obstacle) => {
      MainCanvas.scene.add(obstacle.mesh);
      obstacle.mesh.position.set(obstacle.posX, obstacle.posY, obstacle.posZ);
      obstacle.mesh.rotation.set(obstacle.rotationX, obstacle.rotationY, obstacle.rotationZ);
    })
    this.objectArray.forEach((obstacle) => {
      MainCanvas.scene.add(obstacle.mesh);
      obstacle.mesh.position.set(obstacle.posX, obstacle.posY, obstacle.posZ);
      obstacle.mesh.rotation.set(obstacle.rotationX, obstacle.rotationY, obstacle.rotationZ);
    });
  }
}