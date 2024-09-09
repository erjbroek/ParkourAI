import GUI from '../utilities/GUI.js';

export default class Edit {
  public constructor() {

  }

  public processInput() {

  }

  public update(deltaTime: number) {

  }

  public render(canvas: HTMLCanvasElement) {
    GUI.fillRectangle(canvas, 0, canvas.height * 0.78, canvas.width, canvas.height * 0.22, 255, 255, 255, 0.5, 5);
    GUI.fillRectangle(canvas, canvas.width * 0.85, canvas.height * 0.72, canvas.width * 0.15, canvas.height * 0.06, 255, 255, 255, 0.5);
    for (let i = 0; i < 4; i++) {
      GUI.fillRectangle(canvas, canvas.width * 0.01 + (canvas.width * 0.11 * i), canvas.height * 0.8, canvas.width * 0.1, canvas.height * 0.18, 255, 255, 255, 1, 5)
    }
  }
}