import MainCanvas from '../setup/MainCanvas.js';
import GUI from '../utilities/GUI.js';
import MouseListener from '../utilities/MouseListener.js';
import UICollision from '../utilities/UICollision.js';

export default class Slider {
  private minValue: number;

  private maxValue: number;

  public activeValue: number;

  private defaultValue: number;

  private posX: number;

  private posY: number;

  private width: number;

  private holding: boolean = false;

  private text: string;

  public constructor(sliderText: string, minValue: number, maxValue: number, activeValue: number, posX: number, posY: number, width: number) {
    this.text = sliderText;
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.activeValue = activeValue;
    this.defaultValue = this.defaultValue;
    this.posX = posX;
    this.posY = posY;
    this.width = width;
  }

  public processInput() {
    // once the player holds the button, the this.holding gets set to true so the player is also able to move it while not hovering the slider
    // this way, the mouse doesnt have to be on the exact position of the slider constantly
    if (UICollision.checkCollision(this.posX + this.width * (this.activeValue - this.minValue / (this.maxValue - this.minValue)), this.posY, window.innerWidth * 0.02, window.innerHeight * 0.03)) {
      if (MouseListener.isButtonDown(0)) {
        this.holding = true
      }
    }
    if (MouseListener.isButtonUp(0)) {
      this.holding = false
    }
    if (this.holding) {
      this.activeValue = Math.max(this.minValue, Math.min(this.maxValue, (MouseListener.x2 - this.posX) / this.width))
    }
    MainCanvas.rotate = !this.holding
  }

  public resetToDefault() {
    this.activeValue = this.defaultValue
  }

  public render(canvas: HTMLCanvasElement) {
    const sliderWidth = canvas.width * 0.02
    // console.log(this.activeValue - this.minValue / (this.maxValue - this.minValue))
    GUI.fillRectangle(canvas, this.posX, this.posY, this.width + sliderWidth, canvas.height * 0.03, 200, 200, 200, 0.8, 10)
    GUI.fillRectangle(canvas, this.posX + this.width * (this.activeValue - this.minValue / (this.maxValue - this.minValue)), this.posY, sliderWidth, canvas.height * 0.03, 0, 0, 0, 1, 10)
    GUI.writeText(canvas, `${this.text}: ${Math.round(100 * (this.maxValue - this.minValue) * this.activeValue + this.minValue) / 100}`, this.posX + ((this.width + sliderWidth) / 2) - canvas.width * 0.025, this.posY - canvas.height * 0.01, 'left', 'system-ui', 15, 'white')
  }
}