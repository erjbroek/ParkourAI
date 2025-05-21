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

  public constructor(parkour: Parkour, network: any = []) {
    this.player = new Player(0, false)
    this.bot = new Player(1, true, network)
    this.parkour = parkour;
    console.log(this.bot)
  }

  public startRace() {
    Parkour.levels[Parkour.activeLevel].time = Parkour.levels[Parkour.activeLevel].maxTime

    Game.alivePlayers.forEach((player) => {
      player.killPlayer()
    })
    this.player = new Player(0, false)
    if (Game.neat.usePretrainedNetwork) {
      this.bot = new Player(1, true, Game.neat.trainedNetwork[0])
    } else {
      this.bot = new Player(1, true, Game.neat.untrainedNetwork[0])
    }
    MainCanvas.switchCameraMode(false)
  }
  
  public endRace() {
    this.player.killPlayer();
    this.bot.killPlayer();
    MainCanvas.switchCameraMode(true)
  }
  
  public processInput(deltaTime: number) {
    this.parkour.checkCollision(this.player, [])
    this.player.moveForward(1 * (KeyListener.isKeyDown('KeyW') ? 1 : 0))
    this.player.moveBackward(1 * (KeyListener.isKeyDown('KeyS') ? 1 : 0))
    this.player.moveLeft(1 * (KeyListener.isKeyDown('KeyA') ? 1 : 0))
    this.player.moveRight(1 * (KeyListener.isKeyDown('KeyD') ? 1 : 0))
    if (KeyListener.isKeyDown('Space') && this.player.onGround) {
      this.player.jump()
    }
  }

  public update(deltaTime: number) {
    this.player.update(deltaTime, true);

    this.player.mesh.position.copy(this.player.playerBody.position);
    this.player.mesh.quaternion.copy(this.player.playerBody.quaternion);
    this.parkour.checkCollision(this.player, []);
    this.player.update(deltaTime);
    this.player.calculateFitness()
    
    this.bot.mesh.position.copy(this.bot.playerBody.position);
    this.bot.mesh.quaternion.copy(this.bot.playerBody.quaternion);

    this.parkour.checkCollision(this.bot, []);
    this.bot.update(deltaTime, true)
  }

  public render() {
    
  }
}