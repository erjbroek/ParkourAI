import * as THREE from 'three';

export default class MouseListener {
  public static x: number = 0;

  public static y: number = 0;

  public static x2: number = 0;

  public static y2: number = 0;
  
  public static prevMouseX: number = 0;
  
  public static prevMouseY: number = 0;
  
  public static mouseDelta: { x: number, y: number } = { x: 0, y: 0 };
  
  public static mouseDown: boolean = false;
  
  public static mouseUp: boolean = false;

  private static buttonQueried: Record<number, boolean> = {};

  private static buttonDown: Record<number, boolean> = {};
  
  private static buttonUp: Record<number, boolean> = {};

  public constructor() {
    document.addEventListener('mousedown', (ev: MouseEvent) => {
      MouseListener.buttonDown[ev.button] = true;
      MouseListener.buttonUp[ev.button] = false;
      MouseListener.mouseUp = false;
    });

    document.addEventListener('mouseup', (ev: MouseEvent) => {
      MouseListener.buttonDown[ev.button] = false;
      MouseListener.buttonQueried[ev.button] = false;
      MouseListener.buttonUp[ev.button] = true;
      MouseListener.mouseUp = true;
    });

    document.addEventListener('mousemove', this.mouseMove.bind(this));
  }

  /**
   * Check if a button was pressed this frame.
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

  public static isButtonUp(buttonCode: number = 0): boolean {
    return this.buttonUp[buttonCode];
  }

  public mouseMove(event: MouseEvent) {
    // Calculate normalized mouse position
    MouseListener.x = (event.clientX / window.innerWidth) * 2 - 1;
    MouseListener.y = -(event.clientY / window.innerHeight) * 2 + 1;

    MouseListener.x2 = event.clientX;
    MouseListener.y2 = event.clientY;

    // Calculate mouse delta movement
    MouseListener.mouseDelta.x = event.clientX - MouseListener.prevMouseX;
    MouseListener.mouseDelta.y = event.clientY - MouseListener.prevMouseY;

    // Update previous mouse positions
    MouseListener.prevMouseX = event.clientX;
    MouseListener.prevMouseY = event.clientY;
  }

  public static getMouseDelta(): { x: number, y: number } {
    const delta = { x: MouseListener.mouseDelta.x, y: MouseListener.mouseDelta.y };
    MouseListener.mouseDelta = { x: 0, y: 0 }; // Reset after reading
    return delta;
  }

  public static isMouseMoving(): boolean {
    return MouseListener.mouseDelta.x !== 0 || MouseListener.mouseDelta.y !== 0;
  }
}
