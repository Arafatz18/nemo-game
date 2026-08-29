/**
 * Input.js – Global Keyboard, Mouse & Touch Input Handler
 * 
 * Tracks keys held and one-shot presses.
 * Prevents browser key intercept (e.g. arrow scroll, space scroll).
 */

export default class Input {
    constructor() {
        this.keysDown = new Set();
        this.keysPressed = new Set();
        this.rawKeysDown = new Set();
        this.mouse = { x: 0, y: 0, down: false, clicked: false };

        this.keyMap = {
            'KeyW': 'ArrowUp',
            'KeyA': 'ArrowLeft',
            'KeyS': 'ArrowDown',
            'KeyD': 'ArrowRight',
            'w': 'ArrowUp',
            'a': 'ArrowLeft',
            's': 'ArrowDown',
            'd': 'ArrowRight'
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

        window.addEventListener('keydown', this.handleKeyDown, { passive: false });
        window.addEventListener('keyup', this.handleKeyUp, { passive: false });
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('mouseup', this.handleMouseUp);
        
        // Also listen on document for max compatibility
        document.addEventListener('keydown', this.handleKeyDown, { passive: false });
        document.addEventListener('keyup', this.handleKeyUp, { passive: false });
    }

    handleKeyDown(e) {
        if (!e) return;
        
        // Prevent default browser scrolling on game keys
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.code) || [' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            if (e.preventDefault && typeof e.preventDefault === 'function') {
                e.preventDefault();
            }
        }

        const code = e.code || '';
        const key = (e.key || '').toLowerCase();

        this.rawKeysDown.add(key);
        this.rawKeysDown.add(code);
        if (e.key === ' ') this.rawKeysDown.add(' ');

        let mappedCode = this.keyMap[code] || this.keyMap[key] || code;
        if (!this.keysDown.has(mappedCode) && !this.keysDown.has(code)) {
            this.keysPressed.add(mappedCode);
            this.keysPressed.add(code);
            this.keysPressed.add(key);
        }
        this.keysDown.add(mappedCode);
        this.keysDown.add(code);
    }

    handleKeyUp(e) {
        if (!e) return;
        const code = e.code || '';
        const key = (e.key || '').toLowerCase();

        this.rawKeysDown.delete(key);
        this.rawKeysDown.delete(code);
        if (e.key === ' ') this.rawKeysDown.delete(' ');

        let mappedCode = this.keyMap[code] || this.keyMap[key] || code;
        this.keysDown.delete(mappedCode);
        this.keysDown.delete(code);
    }

    handleMouseMove(e) {
        this.mouse.x = e.clientX || 0;
        this.mouse.y = e.clientY || 0;
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
        
        if (this.keysDown.has(key) || this.rawKeysDown.has(k) || this.rawKeysDown.has(key)) return true;
        if (key === ' ' && (this.rawKeysDown.has(' ') || this.keysDown.has('Space'))) return true;
        if (k === 'space' && (this.rawKeysDown.has(' ') || this.keysDown.has('Space'))) return true;
        if (k === 'arrowleft' && (this.keysDown.has('ArrowLeft') || this.rawKeysDown.has('a') || this.keysDown.has('KeyA'))) return true;
        if (k === 'arrowright' && (this.keysDown.has('ArrowRight') || this.rawKeysDown.has('d') || this.keysDown.has('KeyD'))) return true;
        if (k === 'arrowup' && (this.keysDown.has('ArrowUp') || this.rawKeysDown.has('w') || this.keysDown.has('KeyW'))) return true;
        if (k === 'arrowdown' && (this.keysDown.has('ArrowDown') || this.rawKeysDown.has('s') || this.keysDown.has('KeyS'))) return true;
        if (k === 'shift' && (this.keysDown.has('ShiftLeft') || this.keysDown.has('ShiftRight') || this.rawKeysDown.has('shift'))) return true;
        
        return false;
    }

    isPressed(key) {
        if (!key) return false;
        const k = typeof key === 'string' ? key.toLowerCase() : key;

        if (this.keysPressed.has(key) || this.keysPressed.has(k)) return true;
        if (key === ' ' && (this.keysPressed.has(' ') || this.keysPressed.has('Space'))) return true;
        if (k === 'space' && (this.keysPressed.has(' ') || this.keysPressed.has('Space'))) return true;
        if (k === 'enter' && (this.keysPressed.has('Enter') || this.keysPressed.has('NumpadEnter'))) return true;
        if (k === 'arrowleft' && (this.keysPressed.has('ArrowLeft') || this.keysPressed.has('KeyA') || this.keysPressed.has('a'))) return true;
        if (k === 'arrowright' && (this.keysPressed.has('ArrowRight') || this.keysPressed.has('KeyD') || this.keysPressed.has('d'))) return true;
        if (k === 'arrowup' && (this.keysPressed.has('ArrowUp') || this.keysPressed.has('KeyW') || this.keysPressed.has('w'))) return true;
        if (k === 'shift' && (this.keysPressed.has('ShiftLeft') || this.keysPressed.has('ShiftRight'))) return true;

        return false;
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
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }
}
