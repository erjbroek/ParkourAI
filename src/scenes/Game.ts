import Scene from './Scene.js';
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

  public parkour: Parkour = new Parkour();

  public alivePlayers: Player[] = []

  public static extinct: boolean = false;
  
  public static neat: any;

  public userPlayer: Player;

  public constructor() {
    super();
    this.parkour.generateParkour();
    Game.neat = new NeatManager()
    this.userPlayer = new Player(0, false);

    this.alivePlayers = Game.neat.players;
  }

  public override processInput(): void {
    if (KeyListener.keyPressed('ArrowUp')) {
      this.userPlayer.moveForwardBackward(1)
    }

    // option to end generation if player gets stuck
    if (KeyListener.keyPressed('KeyE')) {
      Game.neat.endGeneration();
    }
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
    if (!Game.extinct) {
      this.updateLight();
    }
    this.alivePlayers = Game.neat.players.filter(player => player.alive);
    Game.extinct = this.alivePlayers.length === 0;

    this.userPlayer.mesh.position.copy(this.userPlayer.playerBody.position);
    this.userPlayer.mesh.quaternion.copy(this.userPlayer.playerBody.quaternion);
    this.parkour.checkCollision(this.userPlayer);
    this.userPlayer.update(deltaTime);

    if (!Game.extinct) {  
      this.alivePlayers.forEach((player) => {
        player.mesh.position.copy(player.playerBody.position);
        player.mesh.quaternion.copy(player.playerBody.quaternion);
        
        this.parkour.checkCollision(player);
        player.update(deltaTime);
      });
      
    } else {
      // console.log(...this.players.map(player => player.brain.score))
      Game.neat.endGeneration();
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
    Game.neat.renderNetwork(canvas, Game.neat.neat.getFittest());

    if (this.clickEditor) {
      GUI.fillRectangle(canvas, canvas.width * 0.9, canvas.height * 0.04, canvas.width * 0.08, canvas.height * 0.05, 255, 255, 255, 0.2, 10);
    } else if (this.hoverEditor) {
      GUI.fillRectangle(canvas, canvas.width * 0.9, canvas.height * 0.04, canvas.width * 0.08, canvas.height * 0.05, 255, 255, 255, 0.4, 10);
    } else {
      GUI.fillRectangle(canvas, canvas.width * 0.9, canvas.height * 0.04, canvas.width * 0.08, canvas.height * 0.05, 255, 255, 255, 0.7, 10);
    }
    GUI.writeText(canvas, `Generation: ${Game.neat.neat.generation}`, canvas.width * 0.5 + canvas.width * 0.04, canvas.height * 0.05, 'center', 'system-ui', 20, 'black')
    GUI.writeText(canvas, `Players alive: ${this.alivePlayers.length}`, canvas.width * 0.5 + canvas.width * 0.04, canvas.height * 0.09, 'center', 'system-ui', 20, 'black')
    GUI.writeText(canvas, `best score this gen: ${Math.round(Game.neat.neat.getFittest().score)}`, canvas.width * 0.5 + canvas.width * 0.04, canvas.height * 0.07, 'center', 'system-ui', 20, 'black')
    GUI.writeText(canvas, `Best score in total: ${Game.neat.highestScore}`, canvas.width * 0.5 + canvas.width * 0.04, canvas.height * 0.11, 'center', 'system-ui', 20, 'black')


    GUI.writeText(canvas, 'Edit level', canvas.width * 0.9 + canvas.width * 0.04, canvas.height * 0.05 + canvas.height * 0.022, 'center', 'system-ui', 20, 'black')
    if (this.openEditor) {
      this.editor.render(canvas)
    }
  }
}
