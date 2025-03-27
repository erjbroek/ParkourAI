import MainCanvas from '../setup/MainCanvas.js';
import GUI from '../utilities/GUI.js';
import MouseListener from '../utilities/MouseListener.js';
import UICollision from '../utilities/UICollision.js';
import Game from './Game.js';
import Statistics from './Statistics.js';

export default class Settings {
  public visible: boolean = false;

  private closeOpacity = 0.7

  private readyClick: boolean = true;

  public constructor() {

  }

  public processInput() {
    if (MouseListener.isButtonDown(0)) {
      console.log('test')
      if (UICollision.checkSquareCollision(0.9, 0.11, 0.08, 0.05) && this.readyClick) {
        this.visible = !this.visible
        this.readyClick = false
        this.closeOpacity = 0.7
      }
    } else {
      this.readyClick = true
    }

    // hovering effect
    if (UICollision.checkSquareCollision(0.9, 0.11, 0.08, 0.05)) {
      this.closeOpacity = 0.5
    } else {
      this.closeOpacity = 0.7
    }
  }
  

  public update() {

  }
 
  public render(canvas: HTMLCanvasElement, statistics: Statistics) {
    if (this.visible) {
      GUI.fillRectangle(canvas, canvas.width * 0.03, canvas.height * 0.03, canvas.width * 0.84, canvas.height * 0.94, 0, 0, 0, 0.5, 0)
      GUI.fillRectangle(canvas, canvas.width * 0.04, canvas.height * 0.047, canvas.width * 0.3, canvas.height * 0.52, 0, 0, 0, 0.2)
      statistics.renderProgression(canvas.width * 0.35, canvas.height * 0.02, true)
      statistics.renderPerformance(canvas.width * 0.614, canvas.height * 0.02, true)
      const bestPlayer = Game.neat.players[0]
      
      GUI.fillRectangle(canvas, canvas.width * 0.04, canvas.height * 0.6, canvas.width * 0.3, canvas.height * 0.35, 0, 0, 0, 0.2)
      statistics.renderOutput(bestPlayer, canvas.width * 0.06, 0, true)
      Game.neat.renderNetwork(canvas, bestPlayer, canvas.width * 0.35, canvas.height * 0.57);
    } else {
    }
    GUI.fillRectangle(canvas, canvas.width * 0.9, canvas.height * 0.11, canvas.width * 0.08, canvas.height * 0.05, 255, 255, 255, this.closeOpacity, 10);
    GUI.writeText(canvas, 'Settings', canvas.width * 0.9 + canvas.width * 0.04, canvas.height * 0.12 + canvas.height * 0.022, 'center', 'system-ui', 20, 'black')
  }
}