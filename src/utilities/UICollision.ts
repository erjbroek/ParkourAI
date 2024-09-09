import Mousehandler from './MouseHandler.js';

export default class UICollision {
  
  /**
   * Checks for collision between a square and the mouse pointer.
   * 
   * @param xMult - The multiplier for the x-coordinate of the square's position.
   * @param yMult - The multiplier for the y-coordinate of the square's position.
   * @param width - The width of the square.
   * @param height - The height of the square.
   * @returns A boolean indicating whether there is a collision or not.
   */
  public static checkSquareCollision(xMult: number, yMult: number, width: number, height: number): boolean {
    if (
      Mousehandler.x2 > window.innerWidth * xMult &&
      Mousehandler.x2 < window.innerWidth * xMult + window.innerWidth * width &&
      Mousehandler.y2 > window.innerHeight * yMult &&
      Mousehandler.y2 < window.innerHeight * yMult + window.innerHeight *height
    ) {
      return true;
    } 
    return false;
  }
}
