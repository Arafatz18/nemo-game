/**
 * Input.js – Global Keyboard and Mouse Input Handler
 * 
 * Tracks keys currently held (down) and keys pressed this frame.
 * Supports standard codes, lowercase shortcuts, and mouse interactions.
 */

export default class Input {
    constructor() {
        this.keysDown = new Set();
        this.keysPressed = new Set();
        this.rawKeysDown = new Set(); // holds e.key.toLowerCase() and e.code
        this.mouse = { x: 0, y: 0, down: false, clicked: false };
        
        this.keyMap = {
            'KeyW': 'ArrowUp',
            'KeyA': 'ArrowLeft',
            'KeyS': 'ArrowDown',
            'KeyD': 'ArrowRight'
        };

        // Proxy to support input.keys['a'], input.keys.has('Space'), etc.
        const self = this;
        this.keys = new Proxy({}, {
            get(target, prop) {
                if (prop === 'has') {
                    return (key) => self.isDown(key);
                }
                if (typeof prop === 'string') {
                    return self.isDown(prop);
                }
                return false;
            }
        });

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('mouseup', this.handleMouseUp);
    }

    handleKeyDown(e) {
        const code = e.code;
        const key = e.key.toLowerCase();

        this.rawKeysDown.add(key);
        this.rawKeysDown.add(code);
        if (e.key === ' ') this.rawKeysDown.add(' ');

        let mappedCode = this.keyMap[code] || code;
        if (!this.keysDown.has(mappedCode)) {
            this.keysPressed.add(mappedCode);
            this.keysPressed.add(code);
            this.keysPressed.add(key);
        }
        this.keysDown.add(mappedCode);
        this.keysDown.add(code);
    }

    handleKeyUp(e) {
        const code = e.code;
        const key = e.key.toLowerCase();

        this.rawKeysDown.delete(key);
        this.rawKeysDown.delete(code);
        if (e.key === ' ') this.rawKeysDown.delete(' ');

        let mappedCode = this.keyMap[code] || code;
        this.keysDown.delete(mappedCode);
        this.keysDown.delete(code);
    }

    handleMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }

    handleMouseDown(e) {
        this.mouse.down = true;
        this.mouse.clicked = true;
    }

    handleMouseUp(e) {
        this.mouse.down = false;
    }

    isDown(key) {
        if (!key) return false;
        const k = typeof key === 'string' ? key.toLowerCase() : key;
        return this.keysDown.has(key) || 
               this.rawKeysDown.has(k) || 
               (key === ' ' && this.rawKeysDown.has(' ')) ||
               (k === 'shift' && (this.keysDown.has('ShiftLeft') || this.keysDown.has('ShiftRight') || this.rawKeysDown.has('shift')));
    }

    isPressed(key) {
        if (!key) return false;
        const k = typeof key === 'string' ? key.toLowerCase() : key;
        return this.keysPressed.has(key) || 
               this.keysPressed.has(k) ||
               (key === ' ' && this.keysPressed.has(' ')) ||
               (k === 'space' && this.keysPressed.has('Space')) ||
               (k === 'enter' && this.keysPressed.has('Enter')) ||
               (k === 'shift' && (this.keysPressed.has('ShiftLeft') || this.keysPressed.has('ShiftRight')));
    }

    justPressed(key) {
        return this.isPressed(key);
    }

    update() {
        this.keysPressed.clear();
        this.mouse.clicked = false;
    }

    destroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mousedown', this.handleMouseDown);
        window.removeEventListener('mouseup', this.handleMouseUp);
    }
}
