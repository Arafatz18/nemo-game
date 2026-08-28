export default class MemoryViewer {
    constructor() {
        this.memories = [];
        this.isOpen = false;
        this.selectedIndex = 0;
        this.totalMemories = 5;
        this.typewriterIndex = 0;
        this.typewriterTimer = 0;
        this.particles = [];
        for(let i = 0; i < 20; i++) {
            this.particles.push({
                x: Math.random(),
                y: Math.random(),
                speed: Math.random() * 0.05 + 0.01
            });
        }
    }

    open() {
        this.isOpen = true;
        this.selectedIndex = Math.max(0, this.memories.length - 1);
        this.typewriterIndex = 0;
    }

    close() {
        this.isOpen = false;
    }

    addMemory(memory) {
        if (!this.memories.find(m => m.index === memory.index && m.chapter === memory.chapter)) {
            this.memories.push(memory);
        }
    }

    update(dt, input) {
        if (!this.isOpen) return;

        // Update particles
        this.particles.forEach(p => {
            p.y -= p.speed * dt;
            if (p.y < 0) p.y = 1;
        });

        const mem = this.memories[this.selectedIndex];
        if (mem) {
            this.typewriterTimer += dt;
            if (this.typewriterTimer > 0.05) {
                this.typewriterTimer = 0;
                if (this.typewriterIndex < mem.text.length) {
                    this.typewriterIndex++;
                }
            }
        }

        if (input) {
            if (input.justPressed('Escape') || input.justPressed('KeyE')) {
                this.close();
            }
            if (input.justPressed('ArrowLeft') || input.justPressed('KeyA')) {
                if (this.selectedIndex > 0) {
                    this.selectedIndex--;
                    this.typewriterIndex = 0;
                }
            }
            if (input.justPressed('ArrowRight') || input.justPressed('KeyD')) {
                if (this.selectedIndex < this.memories.length - 1) {
                    this.selectedIndex++;
                    this.typewriterIndex = 0;
                }
            }
        }
    }

    render(ctx, canvasWidth, canvasHeight) {
        if (!this.isOpen) return;

        ctx.save();
        
        // Dark overlay
        ctx.fillStyle = 'rgba(5, 10, 15, 0.9)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Draw particles
        ctx.fillStyle = 'rgba(100, 200, 255, 0.5)';
        this.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x * canvasWidth, p.y * canvasHeight, 2, 0, Math.PI * 2);
            ctx.fill();
        });

        // Center panel
        const panelWidth = Math.min(600, canvasWidth * 0.8);
        const panelHeight = Math.min(400, canvasHeight * 0.8);
        const x = (canvasWidth - panelWidth) / 2;
        const y = (canvasHeight - panelHeight) / 2;

        ctx.strokeStyle = '#4a6b8c';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, panelWidth, panelHeight);

        // Border accents
        ctx.fillStyle = '#4a6b8c';
        ctx.fillRect(x - 5, y - 5, 10, 10);
        ctx.fillRect(x + panelWidth - 5, y - 5, 10, 10);
        ctx.fillRect(x - 5, y + panelHeight - 5, 10, 10);
        ctx.fillRect(x + panelWidth - 5, y + panelHeight - 5, 10, 10);

        if (this.memories.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '24px Georgia';
            ctx.textAlign = 'center';
            ctx.fillText('No memories found yet...', canvasWidth / 2, canvasHeight / 2);
        } else {
            const mem = this.memories[this.selectedIndex];
            
            // Title
            ctx.fillStyle = '#ffffff';
            ctx.font = '32px Georgia, serif';
            ctx.textAlign = 'center';
            ctx.fillText(mem.title || 'Memory Fragment', canvasWidth / 2, y + 50);

            // Text
            ctx.fillStyle = '#cccccc';
            ctx.font = '20px Georgia, serif';
            ctx.textAlign = 'left';
            
            const textToDraw = mem.text.substring(0, this.typewriterIndex);
            const words = textToDraw.split(' ');
            let line = '';
            let lineY = y + 120;
            const maxWidth = panelWidth - 80;

            for (let i = 0; i < words.length; i++) {
                const testLine = line + words[i] + ' ';
                if (ctx.measureText(testLine).width > maxWidth && i > 0) {
                    ctx.fillText(line, x + 40, lineY);
                    line = words[i] + ' ';
                    lineY += 30;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, x + 40, lineY);
        }

        // Navigation dots
        const dotSpacing = 20;
        const totalSlots = this.totalMemories; // or this.memories.length if dynamic
        const startX = canvasWidth / 2 - (totalSlots * dotSpacing) / 2;

        for (let i = 0; i < totalSlots; i++) {
            const dotX = startX + i * dotSpacing;
            const dotY = y + panelHeight - 30;
            
            ctx.beginPath();
            ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
            
            if (i < this.memories.length) {
                if (i === this.selectedIndex) {
                    ctx.fillStyle = '#ffffff'; // Selected
                    ctx.shadowColor = '#ffffff';
                    ctx.shadowBlur = 10;
                } else {
                    ctx.fillStyle = '#8ab4f8'; // Collected
                    ctx.shadowBlur = 0;
                }
            } else {
                ctx.strokeStyle = '#333333'; // Empty slot
                ctx.fillStyle = 'transparent';
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
            
            if (ctx.fillStyle !== 'transparent') {
                ctx.fill();
            }
        }

        ctx.restore();
    }

    getCollectedCount() {
        return this.memories.length;
    }

    getTotalCount() {
        return this.totalMemories;
    }

    hasAllMemories() {
        return this.memories.length >= this.totalMemories;
    }
}
