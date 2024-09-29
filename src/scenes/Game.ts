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
  
  public static neat: any;

  public constructor() {
    super();
    this.parkour.generateParkour();
    for (let i = 0; i < 10; i++) {
      this.players.push(new Player(i));
      this.alivePlayers.push(this.players[i])
    }

    // sets up the neat manager and adds neural network to each player
    Game.neat = new NeatManager(this.alivePlayers)
  }

  public override processInput(): void {
    // updates camera position based on active player
    if (KeyListener.keyPressed('Digit1')) {
      if (this.selectedPlayer + 1 <= this.alivePlayers.length - 1) {
        this.selectedPreviousPlayer = this.selectedPlayer;
        this.selectedPlayer++;

        const relativeDistance = new THREE.Vector3().subVectors(this.alivePlayers[this.selectedPlayer].playerBody.position, this.alivePlayers[this.selectedPreviousPlayer].playerBody.position);
        const cameraOffset = new THREE.Vector3(relativeDistance.x, relativeDistance.y, relativeDistance.z);
        MainCanvas.camera.position.add(cameraOffset);
      }
    }
    if (KeyListener.keyPressed('Digit2')) {
      if (this.selectedPlayer - 1 >= 0) {
        this.selectedPreviousPlayer = this.selectedPlayer;
        this.selectedPlayer--;

        const relativeDistance = new THREE.Vector3().subVectors(this.alivePlayers[this.selectedPlayer].playerBody.position, this.alivePlayers[this.selectedPreviousPlayer].playerBody.position);
        const cameraOffset = new THREE.Vector3(relativeDistance.x, relativeDistance.y, relativeDistance.z);
        MainCanvas.camera.position.add(cameraOffset);
      }
    }

    // animates button based on player action
    if (UICollision.checkSquareCollision(0.9, 0.04, 0.08, 0.05)) {
      this.hoverEditor = true;
      if (MouseListener.mouseDown) {
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
    this.alivePlayers.forEach((player) => {
      // updates physics body
      player.mesh.position.copy(player.playerBody.position);
      player.mesh.quaternion.copy(player.playerBody.quaternion);

      this.parkour.checkCollision(player);
      player.update(deltaTime);
    });

    this.updateLight();
    this.updateCamera(deltaTime);

    if (this.openEditor) {
      this.editor.update(deltaTime);    
    }
    return this;
  }

  public updateLight() {
    MainCanvas.directionalLight.position.set(
      this.players[0].mesh.position.x + 70,
      this.players[0].mesh.position.y + 140,
      this.players[0].mesh.position.z -140
    );

    MainCanvas.directionalLight.target.position.set(
      this.players[0].mesh.position.x,
      this.players[0].mesh.position.y,
      this.players[0].mesh.position.z
    );

    MainCanvas.directionalLight.target.updateMatrixWorld();
  }

  // updates position of the camera
  // resets position if player falls 
  public updateCamera(deltaTime: number) {
    const scaledVelocity = new THREE.Vector3(this.alivePlayers[this.selectedPlayer].playerBody.velocity.x, this.alivePlayers[this.selectedPlayer].playerBody.velocity.y, this.alivePlayers[this.selectedPlayer].playerBody.velocity.z).multiplyScalar(deltaTime);
    MainCanvas.orbitControls.target.copy(this.alivePlayers[this.selectedPlayer].mesh.position);

    // this makes sure the camera follows the position of the player
    MainCanvas.camera.position.add(scaledVelocity);

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
    GUI.writeText(canvas, 'Edit level', canvas.width * 0.9 + canvas.width * 0.04, canvas.height * 0.05 + canvas.height * 0.022, 'center', 'system-ui', 20, 'black')
    if (this.openEditor) {
      this.editor.render(canvas)
    }
  }
}
