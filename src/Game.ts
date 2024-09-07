import GameSetup from './GameSetup.js';
import Scene from './Scene.js';
import * as THREE from 'three';

export default class Game extends Scene {
  private cube: THREE.Mesh;

  public constructor() {
    super();
    this.createCube();
  }

  private createCube(): void {
    
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff });
    
    this.cube = new THREE.Mesh(geometry, material);
    GameSetup.scene.add(this.cube);
  }

  public override processInput(): void {

  }

  public override update(deltaTime: number): Scene {
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;
    console.log(deltaTime);
    return this;
  }

  public override render(): void {

    GameSetup.scene.add(this.cube);
    GameSetup.renderer.render(GameSetup.scene, GameSetup.camera);
  }
}
