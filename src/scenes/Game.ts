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
import * as CANNON from 'cannon-es';
import Statistics from './Statistics.js';

export default class Game extends Scene {
  private editor: Edit = new Edit()
  
  private openEditor: boolean = false;
  
  private hoverEditor: boolean = false;
  
  private clickEditor: boolean = false;
  
  private readyClickEditor: boolean = true;

  public parkour: Parkour = new Parkour();

  public static alivePlayers: Player[] = []

  public static extinct: boolean = false;
  
  public static neat: any;

  public static colorMode: number = 0;

  public readyNextLevel: boolean = false;

  public autoProgress: boolean = false;

  public userPlayer: Player;

  public statistics: Statistics = new Statistics();

  public constructor() {
    super();
    // console.log(Statistics.checkpointsReached)
    // for(let i = 0; i < Parkour.levels.length - 1; i++) {
    //   Statistics.checkpointsReached.push(0)
    // }
    Game.neat = new NeatManager()
    this.userPlayer = new Player(0, false);

    Game.alivePlayers = Game.neat.players;
  }

  /**
   * processes player input
   */
  public override processInput(): void {
    if (KeyListener.isKeyDown('ArrowUp')) {
      this.userPlayer.moveForwardBackward(-1)
    }
    if (KeyListener.isKeyDown('ArrowDown')) {
      this.userPlayer.moveForwardBackward(1)
    }
    if (KeyListener.isKeyDown('ArrowLeft')) {
      this.userPlayer.moveLeft(1)
    }
    if (KeyListener.isKeyDown('ArrowRight')) {
      this.userPlayer.moveRight(1)
    } 
    if (KeyListener.isKeyDown('KeyQ') && this.userPlayer.onGround) {
      this.userPlayer.jump()
    }
    if (KeyListener.keyPressed('Delete')) {
      Game.neat.players.forEach((player) => {
        player.calculateFitness()
      })
      Game.neat.neat.sort()
      const populationJson = Game.neat.neat.export(); // Export the current population
      const blob = new Blob([JSON.stringify(populationJson)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gen${Game.neat.neat.generation}_${Math.round(Math.max(...Statistics.highscores))}.json`; 
      a.click();
      URL.revokeObjectURL(url);

    }

    // option to end generation if player gets stuck
    if (!this.openEditor) {
      if (KeyListener.keyPressed('KeyE')) {
        Game.neat.endGeneration();
      }
      if ((MouseListener.isButtonDown(0) && UICollision.checkSquareCollision(0.26, 0.929, 0.1, 0.05)) || this.autoProgress) {
        if (Parkour.levels[Parkour.activeLevel].finished) {
          this.readyNextLevel = true;
          Game.alivePlayers.forEach(player => player.alive = false);
        }
      }
      if (MouseListener.buttonPressed(0)) {
        if (UICollision.checkSquareCollision(0.26, 0.89, 0.012, 0.025)) {
          this.autoProgress = !this.autoProgress;
        }
      }
    }
    if (KeyListener.keyPressed('Digit2')) {
      if (Game.colorMode < 10) {
        Game.colorMode++
        console.log(Game.colorMode)
      }
    }
    if (KeyListener.keyPressed('Digit1')) {
      if (Game.colorMode > 0) {
        Game.colorMode--
        console.log(Game.colorMode)
      }
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
    Game.alivePlayers = Game.neat.players.filter(player => player.alive);
    Game.extinct = Game.alivePlayers.length === 0;


    this.userPlayer.mesh.position.copy(this.userPlayer.playerBody.position);
    this.userPlayer.mesh.quaternion.copy(this.userPlayer.playerBody.quaternion);
    this.parkour.checkCollision(this.userPlayer);
    this.userPlayer.update(deltaTime);
    this.userPlayer.calculateFitness()

    if (!Game.extinct) {  
      if (Game.neat.players.filter(player => player.finished).length > Game.neat.neat.popsize * 0.5 && !Parkour.levels[Parkour.activeLevel].finished) {
        Parkour.levels[Parkour.activeLevel].finished = true
        // Game.neat.neat.generation = 0
      }
      Game.alivePlayers.forEach((player) => {
        player.mesh.position.copy(player.playerBody.position);
        player.mesh.quaternion.copy(player.playerBody.quaternion);
        
        this.parkour.checkCollision(player);
        player.update(deltaTime);
      });
      
    } else {
      if (Parkour.levels[Parkour.activeLevel].finished && this.readyNextLevel) {
        Parkour.activeLevel++
        this.readyNextLevel = false
      }
      Game.neat.endGeneration();      
    }
    if (this.openEditor) {
      this.editor.update(deltaTime);    
    }
    return this;
  }

  public updateLight() {
    const bestPlayer = Game.alivePlayers.reduce((prev, current) => 
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
    // Game.neat.renderNetwork(canvas, Game.neat.neat.getFittest());

    if (this.clickEditor) {
      GUI.fillRectangle(canvas, canvas.width * 0.9, canvas.height * 0.04, canvas.width * 0.08, canvas.height * 0.05, 255, 255, 255, 0.2, 10);
    } else if (this.hoverEditor) {
      GUI.fillRectangle(canvas, canvas.width * 0.9, canvas.height * 0.04, canvas.width * 0.08, canvas.height * 0.05, 255, 255, 255, 0.4, 10);
    } else {
      GUI.fillRectangle(canvas, canvas.width * 0.9, canvas.height * 0.04, canvas.width * 0.08, canvas.height * 0.05, 255, 255, 255, 0.7, 10);
    }
    GUI.writeText(canvas, `Alive: ${Math.round(Game.alivePlayers.length / Game.neat.players.length * 1000) / 10}%`, canvas.width * 0.21, canvas.height * 0.065, 'center', 'system-ui', 20, 'white');
    GUI.writeText(canvas, `Level: ${Parkour.activeLevel}`, canvas.width * 0.133, canvas.height * 0.065, 'center', 'system-ui', 20, 'white');
    GUI.fillRectangle(canvas, canvas.width * 0.26, canvas.height * 0.929, canvas.width * 0.1, canvas.height * 0.05, 0, 0, 0, 0.2, 10)

    if (Parkour.levels[Parkour.activeLevel].finished) {
      GUI.fillRectangle(canvas, canvas.width * 0.26, canvas.height * 0.929, canvas.width * 0.1, canvas.height * 0.05, 200, 252, 200, 0.5, 10)
      GUI.writeText(canvas, 'Next level', canvas.width * 0.31, canvas.height * 0.96, 'center', 'system-ui', 20, 'black')
    } else {
      GUI.fillRectangle(canvas, canvas.width * 0.26, canvas.height * 0.929, (canvas.width * 0.1) * (Math.min(Game.neat.players.filter(player => player.finished).length / (Game.neat.neat.popsize * 0.6), 1)), canvas.height * 0.05, 0, 0, 0, 0.2, 10 * Math.min(Game.neat.players.filter(player => player.finished).length / (Game.neat.neat.popsize * 0.6), 1))
      GUI.writeText(canvas, `${Game.neat.players.filter(player => player.finished).length} / ${Game.neat.neat.popsize * 0.6} players`, canvas.width * 0.31, canvas.height * 0.96, 'center', 'system-ui', 20, 'white')
    }

    GUI.fillRectangle(canvas, canvas.width * 0.26, canvas.height * 0.89, canvas.width * 0.012, canvas.height * 0.025, 100, 100, 100, 0.4, 8)
    GUI.drawRectangle(canvas, canvas.width * 0.26, canvas.height * 0.89, canvas.width * 0.012, canvas.height * 0.025, 100, 100, 100, 0.55, 3, 8)
    GUI.writeText(canvas, 'Auto-progress', canvas.width * 0.284, canvas.height * 0.909, 'left', 'system-ui', 15, 'black')
    if (this.autoProgress) {
      GUI.fillCircle(canvas, canvas.width * 0.2661, canvas.height * 0.9025, canvas.height * 0.008, 0, 0, 0, 0.8)
    }

    // GUI.writeText(canvas, `Generation: ${Game.neat.neat.generation}`, canvas.width * 0.5, canvas.height * 0.07, 'center', 'system-ui', 14, 'black');
    // GUI.writeText(canvas, `Color mode ${Game.colorMode.toString()}`, canvas.width * 0.5, canvas.height * 0.07, 'center', 'system-ui', 14, 'black');
    GUI.writeText(canvas, 'Edit level', canvas.width * 0.9 + canvas.width * 0.04, canvas.height * 0.05 + canvas.height * 0.022, 'center', 'system-ui', 20, 'black')
    if (this.openEditor) { 
      this.editor.render(canvas)
    } else {
      this.statistics.chooseVisualisation()
      if (!Game.extinct) {
        const bestPlayer = Game.alivePlayers.reduce((prev, current) => 
          (prev.brain.score > current.brain.score) ? prev : current
        );
        Statistics.renderOutput(bestPlayer);
      }
    }
  }
}
