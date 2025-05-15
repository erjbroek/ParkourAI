import MainCanvas from '../setup/MainCanvas.js';
import GUI from '../utilities/GUI.js';
import MouseListener from '../utilities/MouseListener.js';
import UICollision from '../utilities/UICollision.js';
import Game from './Game.js';
import Slider from './Slider.js';
import Statistics from './Statistics.js';

export default class Settings {
  public visible: boolean = false;

  private closeOpacity = 0.7

  private readyClick: boolean = true;

  private mutationRateSlider: Slider;

  private mutationAmountSlider: Slider;

  private populationSizeSlider: Slider;

  private elitismSlider: Slider;

  public constructor() {
    this.mutationRateSlider = new Slider('Mutation rate', 'The mutation rate is the chance that a mutation happends. If the <br>mutation rate is too low, the agents will stop converging and they will all <br>get the same score after some generations.', 0, 1, Game.neat.neat.mutationRate, [0.2, 0.42], 0.08, MainCanvas.canvas.height * 0.18, 0.17, 2)
    this.mutationAmountSlider = new Slider('Amount of mutations','The mutation amount is the amount of mutations done (with a chance <br>equal to the mutation rate for each mutation). Too many mutations will <br>make growth unstable but increase exploration.', 0, 10, Game.neat.neat.mutationAmount, [1, 4], 0.08, MainCanvas.canvas.height * 0.26, 0.17, 0)
    this.populationSizeSlider = new Slider('Population size', 'Population size sets the amount of players. Usually, more players is <br>better, as there is higher diversity. However, more players can lead to <br>agent performance issues because of large amount of computations needed ', 20, 200, Game.neat.neat.popsize, [50, 217], 0.08, MainCanvas.canvas.height * 0.34, 0.17, 0)
    this.elitismSlider = new Slider('Elitism percentage','The top percentage of players skipping mutation, to make sure the best <br>players are preserved. Having this at 100% means the players will never <br>mutate and change, leading to identical scores', 0, 80, Game.neat.neat.elitism, [20, 40], 0.08, MainCanvas.canvas.height * 0.42, 0.17, 0)
  }

  public processInput() {
    const sliders = [this.mutationRateSlider, this.mutationAmountSlider, this.populationSizeSlider, this.elitismSlider] 

    // processing the input for the sliders
    // it's done like this so you can only move 1 slider at a time
    sliders.forEach(slider => {
      if (sliders.some(slider => slider.holding)) {
        if (slider.holding) {
          slider.processInput();
        }
      } else {
        slider.processInput();
      }
    });
    
    // closes/ opens settings
    if (MouseListener.isButtonDown(0)) {
      if (UICollision.checkSquareCollisionMult(0.9, 0.11, 0.08, 0.05) && this.readyClick) {
        this.visible = !this.visible
        this.readyClick = false
        this.closeOpacity = 0.7
      }
    } else {
      this.readyClick = true
    }

    // hovering effect
    if (UICollision.checkSquareCollisionMult(0.9, 0.11, 0.08, 0.05)) {
      this.closeOpacity = 0.5
    } else {
      this.closeOpacity = 0.7
    }
  }
  
  public update() {
    // sets the values from the sliders to the correct places
    Game.neat.neat.mutationRate = this.mutationRateSlider.activeValue;
    Game.neat.neat.mutationAmount = this.mutationAmountSlider.activeValue;
    Game.neat.neat.popsize = this.populationSizeSlider.activeValue;
    Game.neat.neat.elitism = Math.round(Game.neat.neat.popsize * (this.elitismSlider.activeValue / 100))
  }
 
  public render(canvas: HTMLCanvasElement, statistics: Statistics) {
    if (this.visible) {
      // rendering of the graphs
      GUI.fillRectangle(canvas, canvas.width * 0.03, canvas.height * 0.03, canvas.width * 0.84, canvas.height * 0.94, 0, 0, 0, 0.5, 0)
      statistics.renderProgression(canvas.width * 0.35, canvas.height * 0.02, true)
      statistics.renderPerformance(canvas.width * 0.614, canvas.height * 0.02, true)

      // rendering the network outputs of the best player
      const bestPlayer = Game.neat.players[0]
      GUI.fillRectangle(canvas, canvas.width * 0.04, canvas.height * 0.6, canvas.width * 0.3, canvas.height * 0.35, 0, 0, 0, 0.2)
      statistics.renderOutput(bestPlayer, canvas.width * 0.06, 0, true)
      Game.neat.renderNetwork(canvas, bestPlayer, canvas.width * 0.35, canvas.height * 0.57);
      
      // rendering the sliders
      GUI.fillRectangle(canvas, canvas.width * 0.04, canvas.height * 0.047, canvas.width * 0.3, canvas.height * 0.52, 0, 0, 0, 0.2)
      GUI.fillRectangle(canvas, canvas.width * 0.045, canvas.height * 0.125, canvas.width * 0.29, canvas.height * 0.43, 0, 0, 0, 0.2)
      GUI.writeText(canvas, 'Settings', canvas.width * 0.18, canvas.height * 0.1, 'center', 'system-ui', 30, 'white', 100)
      GUI.drawLine(canvas, canvas.width * 0.1, canvas.height * 0.115, canvas.width * 0.26, canvas.height * 0.115, 255, 255, 255, 1, 1)
      this.mutationRateSlider.render(canvas);
      this.mutationAmountSlider.render(canvas)
      this.populationSizeSlider.render(canvas)
      this.elitismSlider.render(canvas)
    }

    // renders the button
    GUI.fillRectangle(canvas, canvas.width * 0.9, canvas.height * 0.11, canvas.width * 0.08, canvas.height * 0.05, 255, 255, 255, this.closeOpacity, 10);
    GUI.writeText(canvas, 'Settings', canvas.width * 0.9 + canvas.width * 0.04, canvas.height * 0.12 + canvas.height * 0.022, 'center', 'system-ui', 20, 'black')
  }
}