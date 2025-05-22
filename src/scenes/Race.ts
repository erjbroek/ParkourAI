import * as THREE from "three";
import Player from '../objects/Player.js';
import TestPlayer from '../objects/TestPlayer.js';
import KeyListener from '../utilities/KeyListener.js';
import Game from './Game.js';
import Parkour from '../objects/Parkour.js';
import Scene from './Scene.js';
import MainCanvas from '../setup/MainCanvas.js';
import GUI from '../utilities/GUI.js';
import Statistics from './Statistics.js';

export default class Race {
  public player: Player;

  public bot: Player;

  public parkour: Parkour;

  public isRaceActive: boolean = false;
  
  public isRaceReady: boolean = false;
  
  private forward: THREE.Vector3 = new THREE.Vector3();
  
  private right: THREE.Vector3 = new THREE.Vector3();

  public rotation: THREE.Vector3 = new THREE.Vector3(0, Math.PI * 1.5, 0);

  private jumpStatus: boolean = false;
  
  private jumpBuffer: number = 0.1;

  private countdown: number = 3;

  private countdownDone: boolean = false;

  private winner: Player | undefined = undefined;

  public constructor(parkour: Parkour, network: any = []) {
    this.player = new Player(0, false)
    this.bot = new Player(1, true, network)
    this.parkour = parkour;
  }

  public startRace() {
    Parkour.levels[Parkour.activeLevel].time = Parkour.levels[Parkour.activeLevel].maxTime
    MainCanvas.targetCameraPlayer = this.player

    Game.alivePlayers.forEach((player) => {
      player.killPlayer()
    })
    this.player = new Player(0, false)
    if (Game.neat.usePretrainedNetwork) {
      this.bot = new Player(1, true, Game.neat.trainedNetwork[0])
    } else {
      this.bot = new Player(1, true, Game.neat.untrainedNetwork[0])
    }
    let direction: string = '';
    const playerPosition: THREE.Vector3 = Parkour.levels[Parkour.activeLevel].spawnPoint
    const obstaclePosition: THREE.Vector3 = Parkour.levels[Parkour.activeLevel].pieces[2].mesh.position;
    const dx = obstaclePosition.x - playerPosition.x;
    const dz = obstaclePosition.z - playerPosition.z;
    if (Math.abs(dx) > Math.abs(dz)) {
      direction = dx > 0 ? 'right' : 'left';
    } else {
      direction = dz > 0 ? 'backward' : 'straight';
    }
    MainCanvas.switchCameraMode(false, this.player, direction);
    Statistics.startHidingGraphs = true
  }
  
  public endRace() {
    this.player.killPlayer();
    this.bot.killPlayer();
    MainCanvas.switchCameraMode(true, this.player, '')
  }
  
  public processInput(deltaTime: number) {
    if (this.countdownDone) {
      this.parkour.checkCollision(this.player, [])
      this.playerMovement(deltaTime)
    }
    // Statistics.hideUI(deltaTime)
  }

  public update(deltaTime: number) {
    if (!this.countdownDone) {
      this.countdown -= deltaTime;
      this.countdownDone = this.countdown < 0
    } else {
      this.player.update(deltaTime, true);
      this.player.mesh.position.copy(this.player.playerBody.position);
      this.player.mesh.quaternion.copy(this.player.playerBody.quaternion);
      this.parkour.checkCollision(this.player, []);
      this.player.calculateFitness()
      
      this.bot.mesh.position.copy(this.bot.playerBody.position);
      this.bot.mesh.quaternion.copy(this.bot.playerBody.quaternion);
      this.parkour.checkCollision(this.bot, []);
      this.bot.update(deltaTime, true)

      if (this.winner === undefined) {
        if (this.player.finished) {
          this.winner = this.player;
        } else if (this.bot.finished) {
          this.winner = this.bot;
        }
      }
      if (this.winner != undefined) {
        console.log(this.winner.ai)
      }
    }
  }

  public render(canvas: HTMLCanvasElement) {
    if (!this.countdownDone) {
      GUI.writeText(canvas, `${Math.round(this.countdown * 100) / 100}s`, window.innerWidth * 0.55, window.innerHeight * 0.45, 'right', 'system-ui', 100, 'rgb(100, 255, 100)', 500)
    }
  }

  public playerMovement(deltaTime: number) {
    // calculates player direction based on camera azimuth
    this.forward = new THREE.Vector3();
    MainCanvas.camera.getWorldDirection(this.forward);
    this.forward.y = 0;
    this.forward.normalize();
    this.right = new THREE.Vector3();
    this.right.crossVectors(this.forward, this.rotation).normalize();
        
    // Ensure player rotation matches the camera rotation
    const cameraDirection = new THREE.Vector3();
    MainCanvas.camera.getWorldDirection(cameraDirection);
    this.rotation.y = Math.atan2(cameraDirection.x, cameraDirection.z) + Math.PI;
        
    // player movement based on inputs
    const speed = 1.2;
    this.moving = false;
    if (KeyListener.isKeyDown('KeyS')) {
      this.player.playerBody.velocity.x += -speed * this.forward.x;
      this.player.playerBody.velocity.z += -speed * this.forward.z;
      this.moving = true;
    }
    if (KeyListener.isKeyDown('KeyW')) {
      this.player.playerBody.velocity.x += speed * this.forward.x;
      this.player.playerBody.velocity.z += speed * this.forward.z;
      this.moving = true;
    }
    if (KeyListener.isKeyDown('KeyA')) {
      this.player.playerBody.velocity.x += -speed * this.right.x;
      this.player.playerBody.velocity.z += -speed * this.right.z;
      this.moving = true;
    }
    if (KeyListener.isKeyDown('KeyD')) {
      this.player.playerBody.velocity.x += speed * this.right.x;
      this.player.playerBody.velocity.z += speed * this.right.z;
      this.moving = true;
    }
    if (KeyListener.isKeyDown('Space')) {
      this.jumpBuffer = 0.1;
      this.jumpStatus = true;
    }
        
    this.jumpBuffer -= deltaTime;
    if (this.jumpStatus && this.jumpBuffer > 0 && this.player.onGround) {
      this.player.jump();
      this.jumpStatus = false;
    }
        
        
    // if player falls, reset position to last reached checkpoint
    if (this.player.playerBody.position.y < -10) {
      this.player.playerBody.position.set(Parkour.levels[Parkour.activeLevel].spawnPoint.x, Parkour.levels[Parkour.activeLevel].spawnPoint.y, Parkour.levels[Parkour.activeLevel].spawnPoint.z);
      // this.player.playerBody.position.set(this.spawnPoint.x, this.spawnPoint.y + 8, this.spawnPoint.z);
      this.player.playerBody.velocity.set(0, 0, 0);
      this.player.playerBody.angularVelocity.set(0, 0, 0);
      this.player.playerBody.quaternion.set(0, 0, 0, 1);
    }
        
    // corrects speed so it matches the bot
    if (this.player.onGround) {
      this.player.playerBody.velocity.x *= 1.08;
      this.player.playerBody.velocity.z *= 1.08;
    }
    this.player.playerBody.velocity.x *= 0.95;
    this.player.playerBody.velocity.z *= 0.95;
  }

}