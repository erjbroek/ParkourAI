import * as THREE from 'three';

export default class MouseListener {
  public static x2: number = 0;

  public static y2: number = 0;

  public static x: number = 0;

  public static y: number = 0;

  public static mouseDown: boolean = false;

  public static mouseUp: boolean = false;

  public static prevMouseX: number = 0;

  public static prevMouseY: number = 0;

  private static buttonQueried: Record<number, boolean> = {};

  private static buttonDown: Record<number, boolean> = {};

  private static buttonUp: Record<number, boolean> = {};


  public constructor() {
    document.addEventListener('mousedown', (ev: MouseEvent) => {
      MouseListener.buttonDown[ev.button] = true;
      MouseListener.buttonUp[ev.button] = false;
    });
    document.addEventListener('mouseup', (ev: MouseEvent) => {
      MouseListener.buttonDown[ev.button] = false;
      MouseListener.buttonQueried[ev.button] = false;
      MouseListener.buttonUp[ev.button] = true;
    });
    // document.addEventListener('mouseup', this.mouseUp.bind(this));
    document.addEventListener('mousemove', this.mouseMove.bind(this));
  }

  /**
 *
 * @param buttonCode the mouse button to check
 * @returns `true` when the specified button was pressed
 */
  public static buttonPressed(buttonCode: number): boolean {
    if (MouseListener.buttonQueried[buttonCode] === true) return false;
    if (this.buttonDown[buttonCode] === true) {
      this.buttonQueried[buttonCode] = true;
      return true;
    }
    return false;
  }

  public static isButtonDown(buttonCode: number = 0): boolean {
    return this.buttonDown[buttonCode];
  }

  public static isButtonUp(buttonCode: number = 0) {
    return this.buttonUp[buttonCode];
  }

  public mouseMove(event: MouseEvent) {
    MouseListener.x = (event.clientX / window.innerWidth) * 2 - 1;
    MouseListener.y = -(event.clientY / window.innerHeight) * 2 + 1;

    MouseListener.x2 = event.clientX;
    MouseListener.y2 = event.clientY;
  }
}