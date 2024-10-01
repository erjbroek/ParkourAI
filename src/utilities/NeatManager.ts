import * as neat from 'neataptic';
import Player from '../objects/Player.js';
import GUI from '../utilities/GUI.js';

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
      players[i].brain = new neat.architect.Random(8, 1, 3);
    });

    console.log(this.neat)
    console.log(players[0].brain)
  }

  public renderNetwork(canvas: HTMLCanvasElement, player: Player) {
    const inputNodes = player.brain.nodes.filter((node: any) => node.type === 'input');
    const hiddenNodes = player.brain.nodes.filter((node: any) => node.type === 'hidden');
    const outputNodes = player.brain.nodes.filter((node: any) => node.type === 'output');
    hiddenNodes.forEach((node: any, i: number) => {
      node.layer = getLayerDepth(node);
    });

    const highestLayer = Math.max(...hiddenNodes.map((node: any) => node.layer));
    inputNodes.forEach((node: any) => {
      node.layer = 0;
    })
    outputNodes.forEach((node: any) => {
      node.layer = highestLayer + 1
    })

    const nodes = [...inputNodes, ...hiddenNodes, ...outputNodes];

    const startX = canvas.width * 0.1;
    const startY = canvas.height * 0.1;
    const width = canvas.width * 0.1;
    const height = canvas.height * 0.04;

    nodes.forEach((node: any) => {
      const layer = node.layer;
      const x = startX + width * layer;
      const y = startY + height * nodes.filter((n: any) => n.layer === layer).indexOf(node);
      GUI.fillCircle(canvas, x, y, 10, 255, 255, 255, 0.5)
    });

    function getLayerDepth(node: any, depth: number = 0): number {
      if (node.connections.in.some((conn: any) => conn.from.type === 'input')) {
        return depth + 1;
      }
      
      const previousNode = node.connections.in[0].from;
      return getLayerDepth(previousNode, depth + 1);
    }
  }
}