import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GameSetup from '../setup/GameSetup.js';
import Scene from './Scene.js';
import * as THREE from 'three';
import Player from '../objects/Player.js';
import Parkour from '../objects/Parkour.js';
import SceneManager from '../utilities/SceneManager.js';
import GUI from '../utilities/GUI.js';

export default class Game extends Scene {
  private player: Player = new Player();

  public parkour: Parkour = new Parkour();

  public constructor() {
    super();
    this.parkour.generateParkour();
  }

  public override processInput(): void {

  }

  public override update(deltaTime: number): Scene {
    SceneManager.orbitControls.update()
    return this;
  }

  public override render(): void {
    SceneManager.renderer.render(SceneManager.scene, SceneManager.camera);
    // GUI.fillRectangle(GameSetup.canvas, 0, window.innerHeight * 0.9, window.innerWidth, window.innerHeight * 0.1, 255, 255, 255, 0.5, 5);
  }
}
