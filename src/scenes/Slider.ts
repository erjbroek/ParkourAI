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
  
  private numDecimals: number;

  public constructor(sliderText: string, minValue: number, maxValue: number, activeValue: number, posX: number, posY: number, width: number, numDecimals: number) {
    this.text = sliderText;
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.activeValue = activeValue;
    this.defaultValue = this.activeValue;
    this.posX = posX;
    this.posY = posY;
    this.width = width;
    this.numDecimals = numDecimals;
  }

  public processInput() {
    // once the player holds the button, the this.holding gets set to true so the player is also able to move it while not hovering the slider
    // this way, the mouse doesnt have to be on the exact position of the slider constantly
    if (UICollision.checkCollision(this.posX * window.innerWidth + this.width * window.innerWidth * (this.activeValue - this.minValue / (this.maxValue - this.minValue)) / this.maxValue, this.posY, window.innerWidth * 0.02, window.innerHeight * 0.03)) {
      if (MouseListener.isButtonDown(0)) {
        this.holding = true
        MainCanvas.rotate = false
      }
    }
    if (MouseListener.isButtonUp(0)) {
      this.holding = false
      MainCanvas.rotate = true
    }
    if (this.holding) {
      this.activeValue = Math.min(1, Math.max(this.minValue, (MouseListener.x2 - this.posX * window.innerWidth) / (this.width * window.innerWidth)))
      this.activeValue = Math.round((10 ** this.numDecimals) * this.activeValue * this.maxValue) / (10 ** this.numDecimals)
    }
    if (MouseListener.isButtonDown(0) && !this.holding) {
      if (UICollision.checkCollision(this.posX * window.innerWidth + this.width * window.innerWidth + window.innerWidth * 0.02 + window.innerWidth * 0.01, this.posY, window.innerWidth * 0.04, window.innerHeight * 0.03)) {
        this.resetToDefault()
      }
    }

  }

  public resetToDefault() {
    this.activeValue = this.defaultValue
  }

  public render(canvas: HTMLCanvasElement) {
    const sliderWidth = canvas.width * 0.02
    GUI.fillRectangle(canvas, this.posX * window.innerWidth, this.posY, this.width * window.innerWidth + sliderWidth, canvas.height * 0.03, 200, 200, 200, 0.8, 10)
    GUI.fillRectangle(canvas, this.posX * window.innerWidth + this.width * window.innerWidth * (this.activeValue - this.minValue / (this.maxValue - this.minValue)) / this.maxValue, this.posY, sliderWidth, canvas.height * 0.03, 0, 0, 0, 1, 10)
    GUI.writeText(canvas, `${this.text}: ${Math.round((10 ** this.numDecimals) * (this.maxValue - this.minValue) * this.activeValue + this.minValue) / (10 ** this.numDecimals) / this.maxValue}`, this.posX * window.innerWidth + ((this.width * window.innerWidth + sliderWidth) / 2) - canvas.width * 0.025, this.posY - canvas.height * 0.01, 'left', 'system-ui', 15, 'white')

    GUI.fillRectangle(canvas, this.posX * window.innerWidth + this.width * window.innerWidth + sliderWidth + canvas.width * 0.01, this.posY, canvas.width * 0.04, canvas.height * 0.03, 255, 255, 255, 0.6, 10)
    GUI.writeText(canvas, 'Reset', this.posX * window.innerWidth + this.width * window.innerWidth + sliderWidth + canvas.width * 0.01 + (canvas.width * 0.04 / 2), this.posY + canvas.height * 0.022, 'center', 'system-ui', 18, 'black', 400)
  }
}