class KeyListener {
    constructor() {
        window.addEventListener('keydown', (ev) => {
            KeyListener.keyDown[ev.code] = true;
        });
        window.addEventListener('keyup', (ev) => {
            KeyListener.keyDown[ev.code] = false;
            KeyListener.keyPressedQueried[ev.code] = false;
        });
    }
    static isKeyDown(keyCode) {
        return this.keyDown[keyCode] === true;
    }
    static keyPressed(keyCode) {
        if (this.keyPressedQueried[keyCode] === true)
            return false;
        if (this.keyDown[keyCode] === true) {
            this.keyPressedQueried[keyCode] = true;
            return true;
        }
        return false;
    }
}
KeyListener.KEY_ENTER = 'Enter';
KeyListener.KEY_SHIFT_LEFT = 'ShiftLeft';
KeyListener.KEY_SHIFT_RIGHT = 'ShiftRight';
KeyListener.KEY_CTRL_LEFT = 'ControlLeft';
KeyListener.KEY_CTRL_RIGHT = 'ControlRight';
KeyListener.KEY_ALT_LEFT = 'AltLeft';
KeyListener.KEY_ALT_RIGHT = 'AltRight';
KeyListener.KEY_ESC = 'Escape';
KeyListener.KEY_SPACE = 'Space';
KeyListener.KEY_LEFT = 'ArrowLeft';
KeyListener.KEY_UP = 'ArrowUp';
KeyListener.KEY_RIGHT = 'ArrowRight';
KeyListener.KEY_DOWN = 'ArrowDown';
KeyListener.KEY_DEL = 'Delete';
KeyListener.KEY_1 = 'Digit1';
KeyListener.KEY_2 = 'Digit2';
KeyListener.KEY_3 = 'Digit3';
KeyListener.KEY_4 = 'Digit4';
KeyListener.KEY_5 = 'Digit5';
KeyListener.KEY_6 = 'Digit6';
KeyListener.KEY_7 = 'Digit7';
KeyListener.KEY_8 = 'Digit8';
KeyListener.KEY_9 = 'Digit9';
KeyListener.KEY_0 = 'Digit0';
KeyListener.KEY_A = 'KeyA';
KeyListener.KEY_B = 'KeyB';
KeyListener.KEY_C = 'KeyC';
KeyListener.KEY_D = 'KeyD';
KeyListener.KEY_E = 'KeyE';
KeyListener.KEY_F = 'KeyF';
KeyListener.KEY_G = 'KeyG';
KeyListener.KEY_H = 'KeyH';
KeyListener.KEY_I = 'KeyI';
KeyListener.KEY_J = 'KeyJ';
KeyListener.KEY_K = 'KeyK';
KeyListener.KEY_L = 'KeyL';
KeyListener.KEY_M = 'KeyM';
KeyListener.KEY_N = 'KeyN';
KeyListener.KEY_O = 'KeyO';
KeyListener.KEY_P = 'KeyP';
KeyListener.KEY_Q = 'KeyQ';
KeyListener.KEY_R = 'KeyR';
KeyListener.KEY_S = 'KeyS';
KeyListener.KEY_T = 'KeyT';
KeyListener.KEY_U = 'KeyU';
KeyListener.KEY_V = 'KeyV';
KeyListener.KEY_W = 'KeyW';
KeyListener.KEY_X = 'KeyX';
KeyListener.KEY_Y = 'KeyY';
KeyListener.KEY_Z = 'KeyZ';
KeyListener.keyDown = {};
KeyListener.keyPressedQueried = {};
export default KeyListener;
