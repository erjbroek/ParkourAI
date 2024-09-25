class MouseListener {
    constructor() {
        document.addEventListener('mousedown', this.mouseDown);
        document.addEventListener('mouseup', this.mouseUp.bind(this));
        document.addEventListener('mousemove', this.mouseMove.bind(this));
    }
    mouseDown(event) {
        MouseListener.mouseDown = true;
    }
    mouseUp(event) {
        console.log('up');
        MouseListener.mouseDown = false;
    }
    mouseMove(event) {
        MouseListener.x = (event.clientX / window.innerWidth) * 2 - 1;
        MouseListener.y = -(event.clientY / window.innerHeight) * 2 + 1;
        MouseListener.x2 = event.clientX;
        MouseListener.y2 = event.clientY;
    }
}
MouseListener.x2 = 0;
MouseListener.y2 = 0;
MouseListener.x = 0;
MouseListener.y = 0;
MouseListener.mouseDown = false;
MouseListener.mouseUp = false;
MouseListener.prevMouseX = 0;
MouseListener.prevMouseY = 0;
export default MouseListener;
