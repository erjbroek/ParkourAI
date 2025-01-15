import * as neat from 'neataptic';
import * as THREE from 'three';
import { Network } from 'neataptic';
import Player from '../objects/Player.js';
import GUI from '../utilities/GUI.js';
import MainCanvas from '../setup/MainCanvas.js';
import Statistics from '../scenes/Statistics.js';


// this is for a population of 1000 players
const generation = 0;
import networkJSON from '../jsonProgress/gen70_843.json';

export default class NeatManager {
  public neat: any;

  public methods: any = neat.methods;

  public players: Player[] = [];

  public static usePretrainedNetwork: boolean = false;

  public recordPylon: THREE.Mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 1.2, 1000, 32),
    new THREE.MeshBasicMaterial({ color: 0x00ff0f, transparent: true, opacity: 0.2 })
  );

  public constructor() {
    this.neat = new neat.Neat(8, 5, null, {
      mutationRate: 0.3,
      mutationAmount: 1,
      popsize: 1000,
      elitism: 400
    })
    this.neat.generation = generation;

    
    if (NeatManager.usePretrainedNetwork) {
      const json = networkJSON;
      this.neat.population.forEach((network: any, index: number) => {
        this.neat.population[index] = Network.fromJSON(json[index])
      })
    } 
    this.initializePopulation()
    console.log(this.neat.generation)
  }

  /**
   * initializes the population of players with networks
   */
  public initializePopulation(): void {


    this.players.forEach((player: Player) => {
      MainCanvas.scene.remove(player.mesh);
      MainCanvas.world.removeBody(player.playerBody);
    })

    this.players = []
    for (let i = 0; i < this.neat.popsize; i++) {
      this.players.push(new Player(i, true, this.neat.population[i]))
      this.players[i].brain.score = 0;
    }
  }

  /**
   * sorts players based on fitness
   * generates new generation of players based on elitism and fitness
   * mutates new generation
   */
  public endGeneration(): void {
    this.players.forEach((player: Player) => {
      player.calculateFitness()
    })
    this.neat.sort()
    Statistics.averageScores.push(this.neat.getAverage())
    Statistics.previousCheckpointsReached = Statistics.checkpointsReached
    Statistics.checkpointsReached = []
    if (this.neat.population[0].score > Statistics.highscore) {
      Statistics.highscore = this.neat.population[0].score;
      const bestPlayer = this.players.reduce((prev, current) => (prev.brain.score > current.brain.score) ? prev : current);
      MainCanvas.scene.remove(this.recordPylon);
      this.recordPylon.position.set(bestPlayer.mesh.position.x, bestPlayer.mesh.position.y + 500, bestPlayer.mesh.position.z);
      MainCanvas.scene.add(this.recordPylon);
    }
    
    Statistics.highscores.push(this.neat.population[0].score)

    const newGeneration = []

    for (let i = 0; i < this.neat.elitism; i++) {
      newGeneration.push(this.neat.population[i])
    }
    for (let i = 0; i < this.neat.popsize - this.neat.elitism; i++) {
      newGeneration.push(this.neat.getOffspring())
    }
    this.neat.population = newGeneration

    this.neat.mutate()
    this.neat.generation++

    this.initializePopulation()
  }

  /**
   * renders very simple version of network
   * doesn't render network with everything like gates and activation functions (yet)
   * 
   * @param canvas is the canvas the network gets rendered on
   * @param network the selected network to render
   */
  public renderNetwork(canvas: HTMLCanvasElement, network: any) {
    const inputNodes = network.nodes.filter((node: any) => node.type === 'input');
    const hiddenNodes = network.nodes.filter((node: any) => node.type === 'hidden');
    const outputNodes = network.nodes.filter((node: any) => node.type === 'output');

    // adds the layer property to the nodes
    hiddenNodes.forEach((node: any, i: number) => {
      node.layer = getLayerDepth(node);
    });
    inputNodes.forEach((node: any) => {
      node.layer = 0;
    })
    let highestLayer = Math.max(...hiddenNodes.map((node: any) => node.layer));
    outputNodes.forEach((node: any) => {
      node.layer = highestLayer + 1;
      if (node.layer === -Infinity) {
        node.layer = 2
        highestLayer = 1
      }
    })

    // groups nodes together again
    const nodes = [...inputNodes, ...hiddenNodes, ...outputNodes];

    const startX = canvas.width * 0.03;
    const startY = canvas.height * 0.03;
    const width = canvas.width * 0.1;
    const height = canvas.height * 0.3;

    GUI.fillRectangle(canvas, startX - 30, startY, width * (highestLayer + 1) + 60, height, 0, 0, 0, 0.2, 10)

    // ads layerSize and index to the nodes for positioning
    nodes.forEach((node: any) => {
      node.layerSize = nodes.filter((n: any) => n.layer === node.layer).length;
      node.index = nodes.filter((n: any) => n.layer === node.layer).indexOf(node);
    })

    // draws all connections for each node
    nodes.forEach((node: any) => {
      if (node.type != 'output') {
        node.connections.out.forEach((connection: any) => {
          const current = node;
          const next = connection.to;
          const x1 = startX + width * current.layer;
          const y1 = startY + height * (current.index + 1) / (current.layerSize + 1);
          const x2 = startX + width * next.layer;
          const y2 = startY + height * (next.index + 1) / (next.layerSize + 1);
          const weight = connection
          if (node.layer + 1 == next.layer) {
            GUI.drawLine(canvas, x1, y1, x2, y2, 0, 255, 0, 0.5, 5)
          } else if (node.layer != next.layer) {
            // GUI.drawLine(canvas, x1, y1, x2, y2, 255, 0, 0, 0.2, 5)
          }
        })
      }
    })

    // draws nodes based on layer
    nodes.forEach((node: any) => {
      const layer = node.layer;
      const x = startX + width * layer;
      const y = startY + height * (node.index + 1) / (node.layerSize + 1);
      GUI.fillCircle(canvas, x, y, 10, 255, 255, 255, 1)
    });

    /**
     * uses recursion to get the layer number of the node
     * 
     * @param node the node to get the layer number of
     * @param depth the current depth of the node
     * @returns number representing layer of node
     */
    function getLayerDepth(node: any, depth: number = 0): number {
      if (node.connections.in.some((conn: any) => conn.from.type === 'input')) {
        return depth + 1;
      }

      const previousNode = node.connections.in[0].from;
      return getLayerDepth(previousNode, depth + 1);
    }
  }
}