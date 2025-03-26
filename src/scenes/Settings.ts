import MainCanvas from '../setup/MainCanvas.js';
import GUI from '../utilities/GUI.js';
import Game from './Game.js';
import Statistics from './Statistics.js';

export default class Settings {
  public visible: boolean = true;

  public constructor() {

  }

  public processInput() {

  }

  public update() {

  }

  public render(canvas: HTMLCanvasElement) {
    if (this.visible) {
      GUI.fillRectangle(canvas, canvas.width * 0.05, canvas.height * 0.05, canvas.width * 0.9, canvas.height * 0.9, 255, 255, 255, 0.6, 10)
      
    }
  }
}