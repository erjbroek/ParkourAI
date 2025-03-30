export default class Slider {
  private minValue: number;

  private maxValue: number;

  public activeValue: number;

  public defaultValue: number;

  public posX: number;

  public posY: number;

  public width: number;

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

  }

  public resetToDefault() {

  }

  public render() {
    
  }
}