export default class Input {
    constructor() {
        this.keysDown = new Set();
        this.keysPressed = new Set();
        this.mouse = { x: 0, y: 0, down: false, clicked: false };
        
        this.keyMap = {
            'KeyW': 'ArrowUp',
            'KeyA': 'ArrowLeft',
            'KeyS': 'ArrowDown',
            'KeyD': 'ArrowRight'
        };

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
        let code = e.code;
        if (this.keyMap[code]) {
            code = this.keyMap[code];
        }
        if (!this.keysDown.has(code)) {
            this.keysPressed.add(code);
        }
        this.keysDown.add(code);
    }

    handleKeyUp(e) {
        let code = e.code;
        if (this.keyMap[code]) {
            code = this.keyMap[code];
        }
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
        return this.keysDown.has(key);
    }

    isPressed(key) {
        return this.keysPressed.has(key);
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
