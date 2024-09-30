import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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

  public selectedPlayer: number = 0;

  public selectedPreviousPlayer: number = 0;

  public alivePlayers: Player[] = []

  public extinct: boolean = false;
  
  public static neat: any;

  public constructor() {
    super();
    this.parkour.generateParkour();
    for (let i = 0; i < 300; i++) {
      this.players.push(new Player(i));
      this.alivePlayers.push(this.players[i])
    }

    // sets up the neat manager and adds neural network to each player
    Game.neat = new NeatManager(this.alivePlayers)
  }

  public override processInput(): void {
    // updates camera position based on active player

    if (MouseListener.buttonPressed(0)) {
      if (UICollision.checkSquareCollision(0.02, 0.04, 0.03, 0.06)) {
        if (this.selectedPlayer - 1 >= 0) {
          this.selectedPreviousPlayer = this.selectedPlayer;
          this.selectedPlayer--;
  
          const relativeDistance = new THREE.Vector3().subVectors(this.alivePlayers[this.selectedPlayer].playerBody.position, this.alivePlayers[this.selectedPreviousPlayer].playerBody.position);
          const cameraOffset = new THREE.Vector3(relativeDistance.x, relativeDistance.y, relativeDistance.z);
          MainCanvas.camera.position.add(cameraOffset);
        }
      } else if (UICollision.checkSquareCollision(0.2, 0.04, 0.03, 0.06)) {
        if (this.selectedPlayer + 1 <= this.alivePlayers.length - 1) {
          this.selectedPreviousPlayer = this.selectedPlayer;
          this.selectedPlayer++;
  
          const relativeDistance = new THREE.Vector3().subVectors(this.alivePlayers[this.selectedPlayer].playerBody.position, this.alivePlayers[this.selectedPreviousPlayer].playerBody.position);
          const cameraOffset = new THREE.Vector3(relativeDistance.x, relativeDistance.y, relativeDistance.z);
          MainCanvas.camera.position.add(cameraOffset);
        }
      }
    }

    // animates button based on player action
    if (UICollision.checkSquareCollision(0.9, 0.04, 0.08, 0.05)) {
      this.hoverEditor = true;
      if (MouseListener.buttonPressed(0)) {
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
    this.alivePlayers = this.players.filter(player => player.alive);
    this.extinct = this.alivePlayers.length === 0;

    if (!this.extinct) {
      if (this.alivePlayers.length - 1 < this.selectedPlayer) {
        this.selectedPlayer = this.alivePlayers.length - 1;
      }
    
      this.alivePlayers.forEach((player) => {
        player.mesh.position.copy(player.playerBody.position);
        player.mesh.quaternion.copy(player.playerBody.quaternion);
        
        this.parkour.checkCollision(player);
        player.update(deltaTime);
      });
      
      this.updateLight();
      this.updateCamera(deltaTime);
      
    } else {
      console.log(...this.players.map(player => player.brain.score))
      // NeatManager.nextGeneration(this.alivePlayers);
    }

    if (this.openEditor) {
      this.editor.update(deltaTime);    
    }
    return this;
  }

  public updateLight() {
    MainCanvas.directionalLight.position.set(
      this.alivePlayers[this.selectedPlayer].mesh.position.x + 70,
      this.alivePlayers[this.selectedPlayer].mesh.position.y + 140,
      this.alivePlayers[this.selectedPlayer].mesh.position.z -140
    );

    MainCanvas.directionalLight.target.position.set(
      this.alivePlayers[this.selectedPlayer].mesh.position.x,
      this.alivePlayers[this.selectedPlayer].mesh.position.y,
      this.alivePlayers[this.selectedPlayer].mesh.position.z
    );

    MainCanvas.directionalLight.target.updateMatrixWorld();
  }

  // updates position of the camera
  // resets position if player falls 
  public updateCamera(deltaTime: number) {
    const scaledVelocity = new THREE.Vector3(this.alivePlayers[this.selectedPlayer].playerBody.velocity.x, this.alivePlayers[this.selectedPlayer].playerBody.velocity.y, this.alivePlayers[this.selectedPlayer].playerBody.velocity.z).multiplyScalar(deltaTime);
    MainCanvas.orbitControls.target.copy(this.alivePlayers[this.selectedPlayer].mesh.position);
    MainCanvas.camera.position.add(scaledVelocity);

    if (this.alivePlayers[this.selectedPlayer].mesh.position.y < -10) {
      MainCanvas.camera.position.copy(this.alivePlayers[this.selectedPlayer].mesh.position);
      const offset = new THREE.Vector3(0, 21, 16);
      MainCanvas.camera.position.add(offset);
      // MainCanvas.camera.position.copy(this.alivePlayers[this.selectedPlayer].mesh.position);
      // const offset2 = new THREE.Vector3(5, 21, 16);
      // MainCanvas.camera.position.add(offset2);
    }


    MainCanvas.orbitControls.update();
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
    if (this.selectedPlayer != 0) {
      GUI.fillRectangle(canvas, canvas.width * 0.02, canvas.height * 0.04, canvas.width * 0.03, canvas.height * 0.06, 255, 255, 255, 0.7, 10);
      GUI.writeText(canvas, '-', canvas.width * 0.035, canvas.height * 0.09, 'center', 'system-ui', 70, 'grey')
    }
    GUI.writeText(canvas, `Spectating number ${this.players.indexOf(this.alivePlayers[this.selectedPlayer]) + 1}`, canvas.width * 0.125, canvas.height * 0.08, 'center', 'system-ui', 25, 'black');

    if (this.selectedPlayer != this.alivePlayers.length - 1) {

      GUI.fillRectangle(canvas, canvas.width * 0.2, canvas.height * 0.04, canvas.width * 0.03, canvas.height * 0.06, 255, 255, 255, 0.7, 10);
      GUI.writeText(canvas, '+', canvas.width * 0.215, canvas.height * 0.09, 'center', 'system-ui', 70, 'grey')
    }

    GUI.writeText(canvas, 'Edit level', canvas.width * 0.9 + canvas.width * 0.04, canvas.height * 0.05 + canvas.height * 0.022, 'center', 'system-ui', 20, 'black')
    if (this.openEditor) {
      this.editor.render(canvas)
    }
  }
}
