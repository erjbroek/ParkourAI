import * as THREE from 'three';
import SceneManager from './SceneManager.js';

export default class MouseHandler {
  public static coordinates: { x: number, y: number } = { x: 0, y: 0 };

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
  }
}