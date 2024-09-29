import * as neat from 'neataptic';
import Game from '../scenes/Game.js';
import Player from '../objects/Player.js';

export default class NeatManager {
  public neat: any;
  
  public constructor(players: Player[]) {
    this.neat = new neat.Neat(10, 3, null, {
      mutationRate: 0.3,
      elitism: 0.25,
      popsize: players.length,
      network: new neat.architect.Perceptron(8, 2, 6),
    })
  
    this.neat.population.forEach((network: any, i: number) => {
      network.score = 0;
      players[i].brain = network;
    })

    // initial mutation, so not all networks are the same
    this.neat.mutate()
    console.log(this.neat)
  }

  public nextGeneration(players: Player[]) {
    
  }
  
}