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

  public ready: boolean = false;

  private winner: Player | undefined = undefined;

  public finished: boolean = false;

  private playerFinishTime: number = 0;

  private robotFinishTime: number | undefined = undefined;

  private botScore: number =  0;

  private outOfTime: boolean = false;

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
    this.player = new Player(0, false);
    this.bot = new Player(1, true, Game.neat.neat.getFittest());

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
    if (Statistics.visualisationHidden) {
      Statistics.startHidingGraphs = true
      Statistics.visualisationHidden = true
    }
  }
  
  public endRace() {
    this.player.killPlayer();
    this.bot.killPlayer();
    MainCanvas.switchCameraMode(true, this.player, '')
    this.ready = false;
    this.isRaceReady = false;
    if (!Statistics.visualisationHidden) {
      Statistics.startHidingGraphs = true;
      Statistics.visualisationHidden = false;
    }
  }
  
  public processInput(deltaTime: number) {
    if (this.ready) {
      this.parkour.checkCollision(this.player, [])
      this.playerMovement(deltaTime)
    } else {
      if (KeyListener.keyPressed('Space')) {
        this.ready = true;
      }
    }
  }

  public update(deltaTime: number) {
    Statistics.hideUI(deltaTime)
    if (this.ready) {
      if (Parkour.levels[Parkour.activeLevel].time <= 0) {
        this.outOfTime = true;
      }
      
      this.player.update(deltaTime, true);
      this.player.mesh.position.copy(this.player.playerBody.position);
      this.player.mesh.quaternion.copy(this.player.playerBody.quaternion);
      this.parkour.checkCollision(this.player, []);
      
      if (this.winner != this.player) {
        this.bot.mesh.position.copy(this.bot.playerBody.position);
        this.bot.mesh.quaternion.copy(this.bot.playerBody.quaternion);
        this.parkour.checkCollision(this.bot, []);
        this.bot.update(deltaTime, true)
      }

      if (this.winner === undefined) {
        if (this.player.finished) {
          this.winner = this.player;
        } else if (this.bot.finished) {
          this.winner = this.bot;
        }
        this.botScore = this.bot.brain.score
        this.player.calculateFitness()
      } else {
        // if the player wins, the game automatically ends
        if (this.winner == this.player) {
          this.finished = true;
        } else {
          // if the robot is faster, their time is saved
          // once the player finishes, it will show how much seconds
          // the robot was faster than the player
          if (this.robotFinishTime == undefined) {
            this.robotFinishTime = Parkour.levels[Parkour.activeLevel].time
          }
          if (this.player.finished) {
            this.playerFinishTime = Parkour.levels[Parkour.activeLevel].time
            this.finished = true
          }
        }
      }
    }
  }

  public render(canvas: HTMLCanvasElement) {
    if (!this.ready) {
      GUI.writeText(canvas, `Press space to start`, window.innerWidth * 0.62, window.innerHeight * 0.45, 'right', 'system-ui', 60, 'rgba(100, 255, 100, 0.5)', 500)
    }
    
    if (this.finished) {
      GUI.fillRectangle(canvas, window.innerWidth * 0.1, window.innerHeight * 0.1, window.innerWidth * 0.8, window.innerHeight * 0.8, 0, 0, 0, 0.5, 10)
      if (this.winner != undefined && this.ready) {
        if (this.winner == this.player && !this.outOfTime) {
          GUI.writeText(canvas, `You won!`, window.innerWidth * 0.5, window.innerHeight * 0.25, 'center', 'system-ui', 60, 'rgb(100, 255, 100)', 500)
          GUI.writeText(canvas, `Guess the ai hasn't been trained enough`, window.innerWidth * 0.5, window.innerHeight * 0.28, 'center', 'system-ui', 20, 'rgb(86, 133, 86)', 500)
          if (!this.bot.alive) {
            GUI.writeText(canvas, `The robot died`, window.innerWidth * 0.5, window.innerHeight * 0.51, 'center', 'system-ui', 40, 'rgb(100, 255, 100)', 500)
          } else {
            GUI.writeText(canvas, `The robot was simply too slow`, window.innerWidth * 0.5, window.innerHeight * 0.51, 'center', 'system-ui', 40, 'rgb(100, 255, 100)', 500)
          }
          GUI.writeText(canvas, `You were ${Math.round(((this.player.userFitness / this.botScore - 1) * 100) * 10) / 10}% quicker`, window.innerWidth * 0.5, window.innerHeight * 0.54, 'center', 'system-ui', 20, 'rgb(68, 133, 86)', 500)
        }
        if (this.winner == this.bot && !this.outOfTime) {
          GUI.writeText(canvas, `Skill issue`, window.innerWidth * 0.5, window.innerHeight * 0.25, 'center', 'system-ui', 60, 'rgb(255, 100, 100)', 500)
          GUI.writeText(canvas, `Maybe you are the one that needs more training`, window.innerWidth * 0.5, window.innerHeight * 0.28, 'center', 'system-ui', 20, 'rgb(133, 86, 86)', 500)
          GUI.writeText(canvas, `The robot was ${Math.round((this.robotFinishTime - this.playerFinishTime) * 100) / 100} seconds faster`, window.innerWidth * 0.5, window.innerHeight * 0.51, 'center', 'system-ui', 40, 'rgb(255, 100, 100)', 500)
        }
      }
    } else {
      if (this.outOfTime && !this.bot.finished) {
        GUI.fillRectangle(canvas, window.innerWidth * 0.1, window.innerHeight * 0.1, window.innerWidth * 0.8, window.innerHeight * 0.8, 0, 0, 0, 0.5, 10)
        GUI.writeText(canvas, `Out of time`, window.innerWidth * 0.5, window.innerHeight * 0.25, 'center', 'system-ui', 60, 'rgb(255, 100, 100)', 500)
        GUI.writeText(canvas, `Turns out both you and the bot can't<br>do parkour`, window.innerWidth * 0.5, window.innerHeight * 0.28, 'center', 'system-ui', 20, 'rgb(133, 86, 86)', 500)
      } else if (this.outOfTime) {
        GUI.fillRectangle(canvas, window.innerWidth * 0.1, window.innerHeight * 0.1, window.innerWidth * 0.8, window.innerHeight * 0.8, 0, 0, 0, 0.5, 10)
        GUI.writeText(canvas, `Out of time`, window.innerWidth * 0.5, window.innerHeight * 0.25, 'center', 'system-ui', 60, 'rgb(255, 100, 100)', 500)
        GUI.writeText(canvas, `Hint: try strafing`, window.innerWidth * 0.5, window.innerHeight * 0.28, 'center', 'system-ui', 20, 'rgb(133, 86, 86)', 500)
      }
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
    if (KeyListener.isKeyDown('KeyS')) {
      this.player.playerBody.velocity.x += -speed * this.forward.x;
      this.player.playerBody.velocity.z += -speed * this.forward.z;
    }
    if (KeyListener.isKeyDown('KeyW')) {
      this.player.playerBody.velocity.x += speed * this.forward.x;
      this.player.playerBody.velocity.z += speed * this.forward.z;
    }
    if (KeyListener.isKeyDown('KeyA')) {
      this.player.playerBody.velocity.x += -speed * this.right.x;
      this.player.playerBody.velocity.z += -speed * this.right.z;
    }
    if (KeyListener.isKeyDown('KeyD')) {
      this.player.playerBody.velocity.x += speed * this.right.x;
      this.player.playerBody.velocity.z += speed * this.right.z;
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