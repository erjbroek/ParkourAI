import MouseListener from './MouseListener.js';
export default class UICollision {
    static checkSquareCollision(xMult, yMult, width, height) {
        if (MouseListener.x2 > window.innerWidth * xMult &&
            MouseListener.x2 < window.innerWidth * xMult + window.innerWidth * width &&
            MouseListener.y2 > window.innerHeight * yMult &&
            MouseListener.y2 < window.innerHeight * yMult + window.innerHeight * height) {
            return true;
        }
        return false;
    }
}
