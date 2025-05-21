import * as THREE from "three";
import Player from '../objects/Player.js';
import TestPlayer from '../objects/TestPlayer.js';
import KeyListener from '../utilities/KeyListener.js';
import Game from './Game.js';
import Parkour from '../objects/Parkour.js';
import Scene from './Scene.js';
import MainCanvas from '../setup/MainCanvas.js';

export default class Race {
  public player: Player;

  public bot: Player;

  public parkour: Parkour;

  public isRaceActive: boolean = false;
  
  public isRaceReady: boolean = false;

  private moving: boolean = false;
  
  private forward: THREE.Vector3 = new THREE.Vector3();
  
  private right: THREE.Vector3 = new THREE.Vector3();

  private onGround: boolean = true;

  public rotation: THREE.Vector3 = new THREE.Vector3(0, Math.PI * 1.5, 0);

  private jumpStatus: boolean = false;
  
  private jumpBuffer: number = 0.1;
  

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
    console.log(playerPosition, obstaclePosition)
    console.log(dx, dz)
    if (Math.abs(dx) > Math.abs(dz)) {
      direction = dx > 0 ? 'right' : 'left';
    } else {
      direction = dz > 0 ? 'backward' : 'straight';
    }
    console.log(direction)
    MainCanvas.switchCameraMode(false, this.player, direction)
  }
  
  public endRace() {
    this.player.killPlayer();
    this.bot.killPlayer();
    MainCanvas.switchCameraMode(true, this.player, '')
  }
  
  public processInput(deltaTime: number) {
    this.parkour.checkCollision(this.player, [])
    // this.player.moveForward(1 * (KeyListener.isKeyDown('KeyW') ? 1 : 0))
    // this.player.moveBackward(1 * (KeyListener.isKeyDown('KeyS') ? 1 : 0))
    // this.player.moveLeft(1 * (KeyListener.isKeyDown('KeyA') ? 1 : 0))
    // this.player.moveRight(1 * (KeyListener.isKeyDown('KeyD') ? 1 : 0))
    // if (KeyListener.isKeyDown('Space') && this.player.onGround) {
    //   this.player.jump()
    // }
    this.playerMovement(deltaTime)
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

  public update(deltaTime: number) {
    this.player.update(deltaTime, true);

    this.player.mesh.position.copy(this.player.playerBody.position);
    this.player.mesh.quaternion.copy(this.player.playerBody.quaternion);
    this.parkour.checkCollision(this.player, []);
    this.player.calculateFitness()
    
    this.bot.mesh.position.copy(this.bot.playerBody.position);
    this.bot.mesh.quaternion.copy(this.bot.playerBody.quaternion);

    this.parkour.checkCollision(this.bot, []);
    this.bot.update(deltaTime, true)
  }

  public render() {
    
  }
}