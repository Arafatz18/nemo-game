export default class Parallax {
    constructor(chapterData) {
        this.layers = [];
        if (chapterData) {
            this.setChapter(chapterData);
        }
    }

    setChapter(chapterData) {
        this.layers = [];
        
        // Example parsing logic based on a theoretical chapterData.parallax configuration
        const bgData = chapterData.parallax || [
            { type: 'sky', speed: 0, color: '#0a0a15' },
            { type: 'mountains', speed: 0.1, color: '#111520', yOffset: 100 },
            { type: 'trees_far', speed: 0.3, color: '#1a1f2e', yOffset: 200 },
            { type: 'trees_near', speed: 0.6, color: '#242b3d', yOffset: 300 }
        ];

        bgData.forEach(layerConf => {
            this.layers.push({
                type: layerConf.type,
                speed: layerConf.speed,
                color: layerConf.color,
                yOffset: layerConf.yOffset || 0,
                offsetX: 0,
                elements: this.generateElementsForType(layerConf.type)
            });
        });
    }

    generateElementsForType(type) {
        const elements = [];
        if (type === 'mountains') {
            for(let i = 0; i < 5; i++) {
                elements.push({
                    x: i * 400 - 200,
                    width: 600,
                    height: 200 + Math.random() * 150,
                    peakOffset: Math.random() * 200
                });
            }
        } else if (type.includes('trees')) {
            for(let i = 0; i < 10; i++) {
                elements.push({
                    x: i * 150 - 100,
                    height: 100 + Math.random() * 200,
                    width: 20 + Math.random() * 20,
                    branches: Math.floor(3 + Math.random() * 4)
                });
            }
        } else if (type === 'ruins') {
            for(let i = 0; i < 6; i++) {
                elements.push({
                    x: i * 300 - 100,
                    width: 100 + Math.random() * 150,
                    height: 200 + Math.random() * 250,
                    broken: Math.random() > 0.5
                });
            }
        } else if (type === 'fog') {
            for(let i = 0; i < 8; i++) {
                elements.push({
                    x: Math.random() * 2000,
                    y: Math.random() * 100,
                    radius: 100 + Math.random() * 150,
                    alpha: 0.1 + Math.random() * 0.2
                });
            }
        }
        return elements;
    }

    update(cameraX, cameraY) {
        this.layers.forEach(layer => {
            layer.offsetX = cameraX * layer.speed;
        });
    }

    render(ctx, canvasWidth, canvasHeight, camera) {
        this.layers.forEach(layer => {
            ctx.save();
            // Wrap elements based on camera position and speed to create infinite scrolling effect
            const drawX = - (layer.offsetX % canvasWidth);
            
            if (layer.type === 'sky') {
                const grad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
                grad.addColorStop(0, layer.color);
                grad.addColorStop(1, '#050508');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            } else {
                ctx.translate(drawX, 0);
                
                // Draw normal elements
                this.drawLayerElements(ctx, layer, canvasHeight);
                
                // Draw wrapped elements
                ctx.translate(canvasWidth, 0);
                this.drawLayerElements(ctx, layer, canvasHeight);
                
                // Draw previous wrap
                ctx.translate(-canvasWidth * 2, 0);
                this.drawLayerElements(ctx, layer, canvasHeight);
            }
            ctx.restore();
        });
    }

    drawLayerElements(ctx, layer, canvasHeight) {
        ctx.fillStyle = layer.color;
        const baseY = canvasHeight - layer.yOffset;

        if (layer.type === 'mountains') {
            ctx.beginPath();
            ctx.moveTo(-500, canvasHeight);
            layer.elements.forEach(m => {
                ctx.lineTo(m.x, baseY);
                ctx.quadraticCurveTo(m.x + m.width / 2, baseY - m.height, m.x + m.width, baseY);
            });
            ctx.lineTo(3000, canvasHeight);
            ctx.fill();
        } else if (layer.type.includes('trees')) {
            layer.elements.forEach(t => {
                ctx.fillRect(t.x, baseY - t.height, t.width, t.height);
                // Procedural branching logic would go here
                for(let b=0; b<t.branches; b++) {
                    ctx.beginPath();
                    ctx.moveTo(t.x + t.width/2, baseY - t.height + (b * 30));
                    const side = b % 2 === 0 ? 1 : -1;
                    ctx.lineTo(t.x + t.width/2 + (40 * side), baseY - t.height + (b * 30) - 40);
                    ctx.lineWidth = 4;
                    ctx.strokeStyle = layer.color;
                    ctx.stroke();
                }
            });
        } else if (layer.type === 'ruins') {
            layer.elements.forEach(r => {
                ctx.fillRect(r.x, baseY - r.height, r.width, r.height);
                if (r.broken) {
                    ctx.fillStyle = '#000000'; // Cutout
                    ctx.fillRect(r.x + 10, baseY - r.height - 10, r.width - 20, 40);
                    ctx.fillStyle = layer.color;
                }
                // Windows
                ctx.fillStyle = '#050508';
                for(let w=0; w<3; w++) {
                    ctx.fillRect(r.x + 20, baseY - r.height + 40 + w*40, 20, 30);
                }
                ctx.fillStyle = layer.color;
            });
        } else if (layer.type === 'fog') {
            layer.elements.forEach(f => {
                const grad = ctx.createRadialGradient(f.x, baseY - f.y, 0, f.x, baseY - f.y, f.radius);
                grad.addColorStop(0, `rgba(200, 220, 255, ${f.alpha})`);
                grad.addColorStop(1, 'rgba(200, 220, 255, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(f.x, baseY - f.y, f.radius, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }
}
