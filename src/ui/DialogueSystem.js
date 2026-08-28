export default class DialogueSystem {
    constructor() {
        this.active = false;
        this.queue = [];
        this.currentText = '';
        this.displayedText = '';
        this.charIndex = 0;
        this.typeSpeed = 2; // chars per frame
        this.speaker = '';
        this.timer = 0;
        this.blinkTimer = 0;
        this.isTyping = false;
    }

    showDialogue(entries) {
        this.queue = [...entries];
        this.active = true;
        this.loadNext();
    }

    loadNext() {
        if (this.queue.length === 0) {
            this.active = false;
            return;
        }

        const entry = this.queue.shift();
        this.currentText = entry.text;
        this.speaker = entry.speaker || '';
        this.displayedText = '';
        this.charIndex = 0;
        this.isTyping = true;
    }

    update(dt, input) {
        if (!this.active) return;

        this.blinkTimer += dt;

        if (this.isTyping) {
            const charsToAdd = Math.floor(this.typeSpeed * (dt * 60)); // scale by framerate
            this.charIndex += Math.max(1, charsToAdd);
            
            if (this.charIndex >= this.currentText.length) {
                this.charIndex = this.currentText.length;
                this.isTyping = false;
            }
            this.displayedText = this.currentText.substring(0, Math.floor(this.charIndex));
        }

        if (input && (input.keys.has('Space') || input.keys.has('KeyE'))) {
            if (input.justPressed('Space') || input.justPressed('KeyE')) {
                this.advance();
            }
        }
    }

    render(ctx, canvasWidth, canvasHeight) {
        if (!this.active) return;

        const boxWidth = canvasWidth * 0.8;
        const boxHeight = 120;
        const x = (canvasWidth - boxWidth) / 2;
        const y = canvasHeight - boxHeight - 20;

        ctx.save();

        // Border glow
        ctx.shadowColor = 'rgba(100, 150, 255, 0.5)';
        ctx.shadowBlur = 15;
        
        // Main box
        ctx.fillStyle = 'rgba(10, 15, 25, 0.85)';
        ctx.strokeStyle = '#4a6b8c';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.roundRect(x, y, boxWidth, boxHeight, 8);
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Speaker tab
        if (this.speaker) {
            ctx.fillStyle = 'rgba(10, 15, 25, 0.9)';
            ctx.beginPath();
            ctx.roundRect(x, y - 30, ctx.measureText(this.speaker).width + 30, 30, [8, 8, 0, 0]);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#8ab4f8';
            ctx.font = 'bold 16px monospace';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.speaker, x + 15, y - 15);
        }

        // Text
        ctx.fillStyle = '#e8eaed';
        ctx.font = '18px Georgia, serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        // Word wrap handling
        const words = this.displayedText.split(' ');
        let line = '';
        let lineY = y + 20;
        const maxWidth = boxWidth - 40;

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && i > 0) {
                ctx.fillText(line, x + 20, lineY);
                line = words[i] + ' ';
                lineY += 28;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x + 20, lineY);

        // Blinking prompt
        if (!this.isTyping) {
            const blink = Math.floor(this.blinkTimer * 2) % 2 === 0;
            if (blink) {
                ctx.fillStyle = '#ffffff';
                ctx.font = '16px monospace';
                ctx.fillText('▼', x + boxWidth - 25, y + boxHeight - 25);
            }
        }

        ctx.restore();
    }

    advance() {
        if (this.isTyping) {
            this.charIndex = this.currentText.length;
            this.displayedText = this.currentText;
            this.isTyping = false;
        } else {
            this.loadNext();
        }
    }

    isActive() {
        return this.active;
    }

    skip() {
        this.queue = [];
        this.active = false;
    }
}
