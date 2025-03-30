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

  public constructor(minValue: number, maxValue: number, activeValue: number, posX: number, posY: number, width: number) {
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.activeValue = activeValue;
    this.defaultValue = this.defaultValue;
    this.posX = posX;
    this.posY = posY;
    this.width = width;
  }

  public processInput() {
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

    console.log((this.maxValue - this.minValue) * this.activeValue + this.minValue)
  }

  public resetToDefault() {
    this.activeValue = this.defaultValue
  }

  public render(canvas: HTMLCanvasElement) {
    const sliderWidth = canvas.width * 0.02
    // console.log(this.activeValue - this.minValue / (this.maxValue - this.minValue))
    GUI.fillRectangle(canvas, this.posX, this.posY, this.width + sliderWidth, canvas.height * 0.03, 200, 200, 200, 0.8, 0)
    GUI.fillRectangle(canvas, this.posX + this.width * (this.activeValue - this.minValue / (this.maxValue - this.minValue)), this.posY, sliderWidth, canvas.height * 0.03, 0, 0, 0, 1, 0)
    // GUI.drawRectangle(canvas, this.posX  + this.width * (this.activeValue - this.minValue / (this.maxValue - this.minValue)), this.posY, sliderWidth, canvas.height * 0.03, 200, 200, 255, 0.8, 3, 0)
  }
}