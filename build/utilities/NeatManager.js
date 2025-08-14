import * as neat from 'neataptic';
import * as THREE from 'three';
import { Network } from 'neataptic';
import Player from '../objects/Player.js';
import GUI from '../utilities/GUI.js';
import MainCanvas from '../setup/MainCanvas.js';
import Statistics from '../scenes/Statistics.js';
import jsonLevel0 from '../../public/jsonProgress/level0finished.json';
import jsonLevel1 from '../../public/jsonProgress/level1finished.json';
import jsonLevel2 from '../../public/jsonProgress/level2finished.json';
import jsonLevel3 from '../../public/jsonProgress/level3finished.json';
import jsonLevel4 from '../../public/jsonProgress/level4finished.json';
import jsonLevel5 from '../../public/jsonProgress/level5finished.json';
import jsonLevel6 from '../../public/jsonProgress/level6finished.json';
import jsonLevel7 from '../../public/jsonProgress/level7finished.json';
import jsonLevel8 from '../../public/jsonProgress/level8finished.json';
import jsonLevel9 from '../../public/jsonProgress/level9finished.json';
import jsonLevel10 from '../../public/jsonProgress/level10finished.json';
import Parkour from '../objects/Parkour.js';
// this is for a population of 1000 players
const generation = 0;
class NeatManager {
    constructor() {
        this.methods = neat.methods;
        this.players = [];
        this.usePretrainedNetwork = false;
        this.trainedNetwork = [];
        this.untrainedNetwork = [];
        this.activeNetwork = [];
        this.recordPylon = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 1.2, 1000, 32), new THREE.MeshBasicMaterial({ color: 0x00ff0f, transparent: true, opacity: 0.2 }));
        this.preTrainedAgents = [];
        this.neat = new neat.Neat(7, 5, null, {
            mutationRate: 0.3,
            mutationAmount: 2,
            popsize: NeatManager.popSize,
            elitism: NeatManager.popSize / 5
        });
        this.untrainedNetwork = this.neat.population;
        this.activeNetwork = this.untrainedNetwork;
        let population = [];
        this.preTrainedAgents = [
            jsonLevel0,
            jsonLevel1,
            jsonLevel2,
            jsonLevel3,
            jsonLevel4,
            jsonLevel5,
            jsonLevel6,
            jsonLevel7,
            jsonLevel8,
            jsonLevel9,
            jsonLevel10,
        ];
        this.neat.population.forEach((network, index) => {
            population.push(Network.fromJSON(this.preTrainedAgents[Parkour.activeLevel][index]));
        });
        this.trainedNetwork = population;
        this.initializePopulation();
    }
    resetGeneration() {
        this.neat = new neat.Neat(7, 5, null, {
            mutationRate: this.neat.mutationRate,
            mutationAmount: this.neat.mutationAmount,
            popsize: this.neat.popsize,
            elitism: this.neat.popsize / 5
        });
        console.log('reset gen');
        this.initializePopulation();
    }
    /**
     * initializes the population of players with networks
     */
    initializePopulation() {
        console.log('initialise population');
        this.players.forEach((player) => {
            MainCanvas.scene.remove(player.mesh);
            MainCanvas.world.removeBody(player.playerBody);
        });
        this.players = [];
        if (this.usePretrainedNetwork) {
            for (let i = 0; i < this.neat.popsize; i++) {
                this.players.push(new Player(i, true, this.trainedNetwork[i]));
                this.players[i].brain.score = 0;
            }
        }
        else {
            for (let i = 0; i < this.neat.popsize; i++) {
                this.players.push(new Player(i, true, this.neat.population[i]));
                this.players[i].brain.score = 0;
            }
        }
    }
    setTrainedNetwork() {
        const newPopulation = [];
        for (let i = 0; i < this.neat.popsize; i++) {
            newPopulation.push(Network.fromJSON(this.preTrainedAgents[Parkour.activeLevel][i]));
        }
        this.trainedNetwork = newPopulation;
    }
    /**
     * switches network from pretrained one to the one by the player
     * (or the other way around)
     */
    switchNetwork() {
        Parkour.levels[Parkour.activeLevel].time = Parkour.levels[Parkour.activeLevel].maxTime;
        if (this.usePretrainedNetwork) {
            this.neat.population = this.untrainedNetwork;
        }
        else {
            this.neat.population = this.trainedNetwork;
        }
    }
    /**
     * sorts players based on fitness
     * generates new generation of players based on elitism and fitness
     * mutates new generation
     */
    endGeneration() {
        this.players.forEach((player) => {
            player.calculateFitness(true);
        });
        this.neat.sort();
        Statistics.averageScores.push(this.neat.getAverage());
        Statistics.previousCheckpointsReached = [...Statistics.checkpointsReached];
        if (this.neat.population[0].score > Statistics.highscore) {
            Statistics.highscore = this.neat.population[0].score;
            const bestPlayer = this.players.reduce((prev, current) => (prev.brain.score > current.brain.score) ? prev : current);
            MainCanvas.scene.remove(this.recordPylon);
            this.recordPylon.position.set(bestPlayer.mesh.position.x, bestPlayer.mesh.position.y + 500, bestPlayer.mesh.position.z);
            MainCanvas.scene.add(this.recordPylon);
        }
        Statistics.highscores.push(this.neat.population[0].score);
        const newGeneration = [];
        for (let i = 0; i < this.neat.elitism; i++) {
            newGeneration.push(this.neat.population[i]);
        }
        for (let i = 0; i < this.neat.popsize - this.neat.elitism; i++) {
            newGeneration.push(this.neat.getOffspring());
        }
        this.neat.population = newGeneration;
        if (this.usePretrainedNetwork) {
            this.trainedNetwork = newGeneration;
        }
        else {
            this.untrainedNetwork = newGeneration;
        }
        this.neat.mutate();
        this.neat.generation++;
        console.log('end gen');
        this.initializePopulation();
    }
    /**
     * renders very simple version of network
     * doesn't render network with everything like gates and activation functions (yet)
     *
     * @param canvas is the canvas the network gets rendered on
     * @param network the selected network to render
     */
    renderNetwork(canvas, player, addedX = 0, addedY = 0) {
        const inputNodes = player.brain.nodes.filter((node) => node.type === 'input');
        const hiddenNodes = player.brain.nodes.filter((node) => node.type === 'hidden');
        const outputNodes = player.brain.nodes.filter((node) => node.type === 'output');
        // adds the layer property to the nodes
        hiddenNodes.forEach((node, i) => {
            node.layer = getLayerDepth(node);
        });
        inputNodes.forEach((node) => {
            node.layer = 0;
        });
        let highestLayer = Math.max(...hiddenNodes.map((node) => node.layer));
        outputNodes.forEach((node) => {
            node.layer = highestLayer + 1;
            if (node.layer === -Infinity) {
                node.layer = 2;
                highestLayer = 1;
            }
        });
        // groups nodes together again
        const nodes = [...inputNodes, ...hiddenNodes, ...outputNodes];
        const startX = canvas.width * 0.03 + addedX;
        const startY = canvas.height * 0.03 + addedY;
        const width = canvas.width * 0.2065;
        const height = canvas.height * 0.35;
        GUI.fillRectangle(canvas, startX - 30, startY, width * (highestLayer + 1) * 1.2, height, 0, 0, 0, 0.2);
        // ads layerSize and index to the nodes for positioning
        nodes.forEach((node) => {
            node.layerSize = nodes.filter((n) => n.layer === node.layer).length;
            node.index = nodes.filter((n) => n.layer === node.layer).indexOf(node);
        });
        // draws all connections for each node
        const inputValues = player.inputValues;
        nodes.forEach((node) => {
            if (node.type != 'output') {
                node.connections.out.forEach((connection) => {
                    const current = node;
                    const next = connection.to;
                    let x1 = startX + width * current.layer;
                    if (node.type == 'input') {
                        x1 += window.innerWidth * 0.09;
                    }
                    const y1 = startY + height * (current.index + 1) / (current.layerSize + 1);
                    const x2 = startX + width * next.layer;
                    const y2 = startY + height * (next.index + 1) / (next.layerSize + 1);
                    const weight = connection.weight;
                    if (node.layer + 1 == next.layer) {
                        // GUI.drawLine(canvas, x1, y1, x2, y2, 300 / connection.weight, 70 * connection.weight, 0, 0.5, 2 * connection.weight)
                        GUI.drawLine(canvas, x1, y1, x2, y2, 300 / weight, 70 * weight, 0, 0.2 * weight, 1 * (weight ** 1.8));
                    }
                    else if (node.layer != next.layer) {
                        GUI.drawLine(canvas, x1, y1, x2, y2, 300 / weight, 70 * weight, 0, 0.2 * weight, 1 * (weight ** 1.8));
                    }
                });
            }
        });
        const inputCategories = ['Δ X currentPlatform', 'Δ Y currentPlatform', 'Δ Z currentPlatform', 'Δ X nextPlatform', 'Δ Y nextPlatform', 'Δ Z nextPlatform', 'onGround'];
        inputNodes.forEach((node, i) => {
            const x = startX + width * node.layer;
            const y = startY + height * (node.index + 1) / (node.layerSize + 1);
            let color = '';
            if (i < 3) {
                color = '#FFB3A7';
            }
            else if (i >= 3 && i < 6) {
                color = '#B3FFB7';
            }
            else if (i == 6) {
                color = '#B3C7FF';
            }
            else {
                color = '#FFFFB3';
            }
            GUI.writeText(canvas, inputCategories[i], x + window.innerWidth * 0.075, y, 'right', 'system-ui', 18, color);
            GUI.fillCircle(canvas, x + window.innerWidth * 0.09, y, 10, 255, 255, 255, 1);
        });
        hiddenNodes.forEach((node) => {
            const x = startX + width * node.layer;
            const y = startY + height * (node.index + 1) / (node.layerSize + 1);
            GUI.fillCircle(canvas, x, y, 10, 255, 255, 255, 1);
        });
        const output_actions = ['forwards', 'backwards', 'left', 'right', 'Jump'];
        outputNodes.forEach((node, i) => {
            const x = startX + width * node.layer;
            const y = startY + height * (node.index + 1) / (node.layerSize + 1);
            GUI.writeText(canvas, output_actions[i], x + 20, y, 'left', 'system-ui', 20, 'white');
            GUI.fillCircle(canvas, x, y, 10, 255, 255, 255, 1);
        });
        if (!player.alive) {
            GUI.fillRectangle(canvas, startX - 30, startY, width * (highestLayer + 1) * 1.2, height, 0, 0, 0, 0.7);
            GUI.fillRectangle(canvas, startX - 30, startY, width * (highestLayer + 1) * 1.2, height, 255, 0, 0, 0.1);
            GUI.writeText(canvas, 'This player died :(', startX + width * 1.15, startY + height * 0.55, 'center', 'system-ui', 30, 'Pink', 300);
        }
        /**
         * uses recursion to get the layer number of the node
         *
         * @param node the node to get the layer number of
         * @param depth the current depth of the node
         * @returns number representing layer of node
         */
        function getLayerDepth(node, depth = 0) {
            if (node.connections.in.some((conn) => conn.from.type === 'input')) {
                return depth + 1;
            }
            const previousNode = node.connections.in[0].from;
            return getLayerDepth(previousNode, depth + 1);
        }
    }
}
NeatManager.popSize = 150;
NeatManager.networkLoaded = false;
export default NeatManager;
