import MouseListener from './MouseListener.js';
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
    static checkSquareCollisionMult(xMult, yMult, width, height) {
        if (MouseListener.x2 > window.innerWidth * xMult &&
            MouseListener.x2 < window.innerWidth * xMult + window.innerWidth * width &&
            MouseListener.y2 > window.innerHeight * yMult &&
            MouseListener.y2 < window.innerHeight * yMult + window.innerHeight * height) {
            return true;
        }
        return false;
    }
    static checkCircleCollision(posX, posY, radius) {
        const distX = MouseListener.x2 - posX;
        const distY = MouseListener.y2 - posY;
        const distance = Math.sqrt(distX * distX + distY * distY);
        if (distance <= radius) {
            return true;
        }
        return false;
    }
    static checkCollision(posX, posY, width, height) {
        if (MouseListener.x2 > posX &&
            MouseListener.x2 < posX + width &&
            MouseListener.y2 > posY &&
            MouseListener.y2 < posY + height) {
            return true;
        }
        return false;
    }
}
