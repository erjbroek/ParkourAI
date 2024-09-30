import * as neat from 'neataptic';
import Player from '../objects/Player.js';

export default class NeatManager {
  public neat: any;
  
  public constructor(players: Player[]) {
    this.neat = new neat.Neat(10, 2, null, {
      mutationRate: 0.3,
      mutationAmount: 3,
      elitism: 0.25 * players.length,
      popsize: players.length
    })
  
    this.neat.population.forEach((network: any, i: number) => {
      network.score = 0;
      players[i].brain = new neat.architect.Perceptron(8, 1, 1, 3);
    });

    console.log(this.neat)
  }
}