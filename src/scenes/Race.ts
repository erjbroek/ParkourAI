import Player from '../objects/Player.js';
import TestPlayer from '../objects/TestPlayer.js';
import KeyListener from '../utilities/KeyListener.js';
import Game from './Game.js';
import Scene from './Scene.js';

export default class Race {
  public player: TestPlayer;

  public bot: Player;

  public constructor() {
    this.player = new TestPlayer(0)
    if (Game.neat.usePretrainedNetwork) {

      this.bot = new Player(1, true, Game.neat.preTrainedAgents[0])
    } else {
      this.bot = new Player(1, true, Game.neat.untrainedNetwork[0])
    }
    console.log(this.bot)
  }

  public processInput(deltaTime: number) {
    this.player.updateMovement(deltaTime);
  }

  public update(deltaTime: number) {
    this.player.update(deltaTime);
    this.bot.update(deltaTime)
  }

  public render() {
    
  }
}