import GUI from '../utilities/GUI.js';
import Mousehandler from '../utilities/MouseHandler.js';

export default class Edit {
  private objectImages: HTMLImageElement[] = [];

  public constructor() {
    this.objectImages.push(GUI.loadNewImage('./assets/normalBlock.png'));
    this.objectImages.push(GUI.loadNewImage('./assets/longBlock.png'));
    this.objectImages.push(GUI.loadNewImage('./assets/bridgeBlock.png'));
    this.objectImages.push(GUI.loadNewImage('./assets/platformBlock.png'));
  }

  public processInput() {
    if (Mousehandler.mouseDown) {
      for (let i = 0; i < 4; i++) {
        if (
        Mousehandler.x2 >= window.innerWidth * 0.02 + (window.innerWidth * 0.1 * i) &&
        Mousehandler.x2 <= window.innerWidth * 0.02 + (window.innerWidth * 0.1 * i) + window.innerWidth * 0.09 &&
        Mousehandler.y2 >= window.innerHeight * 0.8 &&
        Mousehandler.y2 <= window.innerHeight * 0.8 + window.innerHeight * 0.16
      ) {
          console.log(`clicked on object ${i}`);
        }
      }
    }
  }

  public update(deltaTime: number) {

  }

  public render(canvas: HTMLCanvasElement) {
    GUI.fillRectangle(canvas, canvas.width * 0.89, canvas.height * 0.72, canvas.width * 0.15, canvas.height * 0.06, 255, 255, 255, 0.5);
    GUI.fillRectangle(canvas, 0, canvas.height * 0.78, canvas.width, canvas.height * 0.24, 255, 255, 255, 0.5, 5);
    GUI.fillRectangle(canvas, 0, canvas.height * 0.98, canvas.width, canvas.height * 0.02, 255, 255, 255, 0.8)
    for (let i = 0; i < 4; i++) {
      GUI.fillRectangle(canvas, canvas.width * 0.02 + (canvas.width * 0.1 * i), canvas.height * 0.8, canvas.width * 0.09, canvas.height * 0.16, 255, 255, 255, 1, 15)
      GUI.drawImage(canvas, this.objectImages[i], canvas.width * 0.04 + (canvas.width * 0.1 * i), canvas.height * 0.81, canvas.width * 0.05, canvas.height * 0.15)
    }
  }
}