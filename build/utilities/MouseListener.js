class MouseListener {
    constructor() {
        document.addEventListener('mousedown', (ev) => {
            MouseListener.buttonDown[ev.button] = true;
            MouseListener.buttonUp[ev.button] = false;
            MouseListener.mouseUp = false;
        });
        document.addEventListener('mouseup', (ev) => {
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
    static buttonPressed(buttonCode) {
        if (MouseListener.buttonQueried[buttonCode] === true)
            return false;
        if (this.buttonDown[buttonCode] === true) {
            this.buttonQueried[buttonCode] = true;
            return true;
        }
        return false;
    }
    static isButtonDown(buttonCode = 0) {
        return this.buttonDown[buttonCode];
    }
    static isButtonUp(buttonCode = 0) {
        return this.buttonUp[buttonCode];
    }
    mouseMove(event) {
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
    static getMouseDelta() {
        const delta = { x: MouseListener.mouseDelta.x, y: MouseListener.mouseDelta.y };
        MouseListener.mouseDelta = { x: 0, y: 0 }; // Reset after reading
        return delta;
    }
    static isMouseMoving() {
        return MouseListener.mouseDelta.x !== 0 || MouseListener.mouseDelta.y !== 0;
    }
}
MouseListener.x = 0;
MouseListener.y = 0;
MouseListener.x2 = 0;
MouseListener.y2 = 0;
MouseListener.prevMouseX = 0;
MouseListener.prevMouseY = 0;
MouseListener.mouseDelta = { x: 0, y: 0 };
MouseListener.mouseDown = false;
MouseListener.mouseUp = false;
MouseListener.buttonQueried = {};
MouseListener.buttonDown = {};
MouseListener.buttonUp = {};
export default MouseListener;
