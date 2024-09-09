import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Scene from './Scene.js';
import * as THREE from 'three';
import Player from '../objects/Player.js';
import Parkour from '../objects/Parkour.js';
import CanvasManager from '../setup/CanvasManager.js';
import GUI from '../utilities/GUI.js';
import UICollision from '../utilities/UICollision.js';
import Edit from './Edit.js';
import Mousehandler from '../utilities/MouseHandler.js';

export default class Game extends Scene {
  private player: Player = new Player();

  private openEditor: boolean = false;

  private hoverEditor: boolean = false;

  private clickEditor: boolean = false;

  private readyClickEditor: boolean = true;

  private editor: Edit = new Edit()

  public parkour: Parkour = new Parkour();

  public constructor() {
    super();
    this.parkour.generateParkour();
  }

  public override processInput(): void {
    // animates button based on player action
    if (UICollision.checkSquareCollision(0.9, 0.04, 0.08, 0.05)) {
      this.hoverEditor = true;
      if (Mousehandler.mouseDown) {
        this.clickEditor = true;
        if (this.readyClickEditor) {
          this.readyClickEditor = false;
          this.openEditor = !this.openEditor;
        }
      } else {
        this.clickEditor = false;
        this.readyClickEditor = true;
      }
    } else {
      this.hoverEditor = false;
      this.clickEditor = false;
    }
  }

  public override update(deltaTime: number): Scene {
    // makes sure orbital camera doesnt move when in the editor
    if (Mousehandler.y2 >= window.innerHeight * 0.8 && this.openEditor) {
      CanvasManager.orbitControls.enabled = false;
    } else {
      CanvasManager.orbitControls.enabled = true;
    }
    return this;
  }

  public override render(): void {
    CanvasManager.renderer.render(CanvasManager.scene, CanvasManager.camera);
    const canvas = GUI.getCanvas();
    if (this.clickEditor) {
      GUI.fillRectangle(canvas, canvas.width * 0.9, canvas.height * 0.04, canvas.width * 0.08, canvas.height * 0.05, 255, 255, 255, 0.2, 10);
    } else if (this.hoverEditor) {
      GUI.fillRectangle(canvas, canvas.width * 0.9, canvas.height * 0.04, canvas.width * 0.08, canvas.height * 0.05, 255, 255, 255, 0.4, 10);
    } else {
      GUI.fillRectangle(canvas, canvas.width * 0.9, canvas.height * 0.04, canvas.width * 0.08, canvas.height * 0.05, 255, 255, 255, 0.7, 10);
    }
    GUI.writeText(canvas, 'Edit level', canvas.width * 0.9 + canvas.width * 0.04, canvas.height * 0.05 + canvas.height * 0.022, 'center', 'system-ui', 20, 'black')
    if (this.openEditor) {
      this.editor.processInput()
      this.editor.render(canvas)
    }
  }
}
