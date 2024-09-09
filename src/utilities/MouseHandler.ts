import * as THREE from 'three';
import CanvasManager from '../setup/CanvasManager.js';

export default class MouseHandler {
  public static x2: number = 0;

  public static y2: number = 0;

  public static x: number = 0;

  public static y: number = 0;

  public static mouseDown: boolean = false;

  public static mouseUp: boolean = false;

  public static prevMouseX: number = 0;

  public static prevMouseY: number = 0;

  public constructor() {
    document.addEventListener('mousedown', this.mouseDown);
    document.addEventListener('mouseup', this.mouseUp.bind(this));
    document.addEventListener('mousemove', this.mouseMove.bind(this));
  }

  public mouseDown(event: MouseEvent) {
    MouseHandler.mouseDown = true;
  }

  public mouseUp(event: MouseEvent) {
    console.log('up')
    MouseHandler.mouseDown = false;
  }
  
  public mouseMove(event: MouseEvent) {
    MouseHandler.x = (event.clientX / window.innerWidth) * 2 - 1;
    MouseHandler.y = -(event.clientY / window.innerHeight) * 2 + 1;

    MouseHandler.x2 = event.clientX;
    MouseHandler.y2 = event.clientY;
  }
}