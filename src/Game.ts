import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GameSetup from './GameSetup.js';
import Scene from './Scene.js';
import * as THREE from 'three';

export default class Game extends Scene {
  private cube: THREE.Mesh;

  public constructor() {
    super();
    this.generateParkour();
  }

  private generateParkour(): void {
    const geometry = new THREE.BoxGeometry(10, 3, 8);
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff });
    
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.position.set(0, -5, -10);
    GameSetup.scene.add(this.cube);
  }

  public override processInput(): void {
    GameSetup.orbitControls.update();
  }

  public override update(deltaTime: number): Scene {
    return this;
  }

  public override render(): void {

    GameSetup.scene.add(this.cube);
    GameSetup.renderer.render(GameSetup.scene, GameSetup.camera);
  }
}
