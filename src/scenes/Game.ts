import Scene from './Scene.js';
import * as THREE from 'three';
import Player from '../objects/Player.js';
import Parkour from '../objects/Parkour.js';
import GUI from '../utilities/GUI.js';
import UICollision from '../utilities/UICollision.js';
import Edit from './Edit.js';
import MouseListener from '../utilities/MouseListener.js';
import MainCanvas from '../setup/MainCanvas.js';
import NeatManager from '../utilities/NeatManager.js';
import KeyListener from '../utilities/KeyListener.js';

export default class Game extends Scene {
  private editor: Edit = new Edit()
  
  private openEditor: boolean = false;
  
  private hoverEditor: boolean = false;
  
  private clickEditor: boolean = false;
  
  private readyClickEditor: boolean = true;
 
  public players: Player[] = [];

  public parkour: Parkour = new Parkour();

  public alivePlayers: Player[] = []

  public extinct: boolean = false;
  
  public static neat: any;

  public constructor() {
    super();
    this.parkour.generateParkour();
    for (let i = 0; i < 100; i++) {
      this.players.push(new Player(i));
      this.alivePlayers.push(this.players[i])
    }

    // sets up the neat manager and adds neural network to each player
    Game.neat = new NeatManager(this.alivePlayers)
  }

  public override processInput(): void {
    // animates button based on player action
    if (UICollision.checkSquareCollision(0.9, 0.04, 0.08, 0.05)) {
      this.hoverEditor = true;
      if (MouseListener.isButtonDown(0)) {
        this.clickEditor = true;
        if (this.readyClickEditor) {
          this.readyClickEditor = false;
          this.openEditor = !this.openEditor;

          Edit.gridHelper.visible = this.openEditor;
      
          // makes sure obstacle gets removed if it didn't get saved
          if (!this.editor.confirmedAdded) {
            this.editor.removeObstacle()
          }
        }
      } else {
        this.clickEditor = false;
        this.readyClickEditor = true;
      }
    } else {
      this.hoverEditor = false;
      this.clickEditor = false;
    } 

    if (this.openEditor) {
      this.editor.processInput();    
    }
  }

  public override update(deltaTime: number): Scene {
    if (!this.extinct) {
      this.updateLight();
    }
    this.alivePlayers = this.players.filter(player => player.alive);
    this.extinct = this.alivePlayers.length === 0;

    if (!this.extinct) {  
      this.alivePlayers.forEach((player) => {
        player.mesh.position.copy(player.playerBody.position);
        player.mesh.quaternion.copy(player.playerBody.quaternion);
        
        this.parkour.checkCollision(player);
        player.update(deltaTime);
      });
      
    } else {
      // console.log(...this.players.map(player => player.brain.score))
      // NeatManager.nextGeneration(this.alivePlayers);
    }

    if (this.openEditor) {
      this.editor.update(deltaTime);    
    }
    return this;
  }

  public updateLight() {
    const bestPlayer = this.alivePlayers.reduce((prev, current) => 
      (prev.brain.score > current.brain.score) ? prev : current
    );

    MainCanvas.directionalLight.position.set(
      bestPlayer.mesh.position.x + 70,
      bestPlayer.mesh.position.y + 140,
      bestPlayer.mesh.position.z - 140
    );

    MainCanvas.directionalLight.target.position.set(
      bestPlayer.mesh.position.x,
      bestPlayer.mesh.position.y,
      bestPlayer.mesh.position.z
    );

    MainCanvas.directionalLight.target.updateMatrixWorld();
  }

  public override render(): void {
    MainCanvas.renderer.render(MainCanvas.scene, MainCanvas.camera);
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
      this.editor.render(canvas)
    }
  }
}
