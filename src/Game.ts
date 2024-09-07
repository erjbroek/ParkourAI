import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GameSetup from './GameSetup.js';
import Scene from './Scene.js';
import * as THREE from 'three';
import Player from './Player.js';

export default class Game extends Scene {
  private startingPlatform: THREE.Mesh;

  private player: Player = new Player();

  public constructor() {
    super();
    this.generateParkour();
    this.player.createPlayer();
  }

  private generateParkour(): void {
    const geometry = new THREE.BoxGeometry(15, 0.5, 8);
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff });
    
    this.startingPlatform = new THREE.Mesh(geometry, material);
    this.startingPlatform.position.set(0, 0, 0);
    GameSetup.scene.add(this.startingPlatform);
  }

  public override processInput(): void {
    GameSetup.orbitControls.update();
  }

  public override update(deltaTime: number): Scene {
    return this;
  }

  public override render(): void {

    GameSetup.scene.add(this.startingPlatform);
    GameSetup.renderer.render(GameSetup.scene, GameSetup.camera);
  }
}
