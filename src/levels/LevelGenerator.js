export default class LevelGenerator {
    static generateTrees(count, levelWidth, groundY) {
        const trees = [];
        for (let i = 0; i < count; i++) {
            trees.push({
                x: Math.random() * levelWidth,
                y: groundY,
                height: 150 + Math.random() * 200,
                width: 15 + Math.random() * 25,
                lean: (Math.random() - 0.5) * 0.5,
                branches: this.generateBranches(3 + Math.floor(Math.random() * 4))
            });
        }
        return trees;
    }

    static generateBranches(count) {
        const branches = [];
        for (let i = 0; i < count; i++) {
            branches.push({
                heightRatio: 0.2 + Math.random() * 0.7,
                length: 40 + Math.random() * 60,
                angle: (Math.random() * Math.PI / 2) * (Math.random() > 0.5 ? 1 : -1) - Math.PI / 2
            });
        }
        return branches;
    }

    static generateRocks(count, levelWidth, groundY) {
        const rocks = [];
        for (let i = 0; i < count; i++) {
            const points = [];
            const numPoints = 5 + Math.floor(Math.random() * 5);
            const radius = 20 + Math.random() * 40;
            
            for (let j = 0; j < numPoints; j++) {
                const angle = (j / numPoints) * Math.PI * 2;
                const r = radius * (0.6 + Math.random() * 0.4);
                points.push({
                    x: Math.cos(angle) * r,
                    y: Math.sin(angle) * r
                });
            }

            rocks.push({
                x: Math.random() * levelWidth,
                y: groundY,
                points: points
            });
        }
        return rocks;
    }

    static generateGrass(count, levelWidth, groundY) {
        const grass = [];
        for (let i = 0; i < count; i++) {
            grass.push({
                x: Math.random() * levelWidth,
                y: groundY,
                blades: 3 + Math.floor(Math.random() * 5),
                height: 10 + Math.random() * 15
            });
        }
        return grass;
    }

    static generateCrystals(count, levelWidth, caveHeight) {
        const crystals = [];
        for (let i = 0; i < count; i++) {
            crystals.push({
                x: Math.random() * levelWidth,
                y: Math.random() * caveHeight, // Place anywhere in cave
                width: 10 + Math.random() * 20,
                height: 30 + Math.random() * 60,
                angle: (Math.random() - 0.5) * Math.PI,
                hue: 180 + Math.random() * 40 // Blue to cyan
            });
        }
        return crystals;
    }

    static generateWaterSurface(startX, endX, y) {
        const points = [];
        const segments = Math.ceil((endX - startX) / 20);
        for (let i = 0; i <= segments; i++) {
            points.push({
                x: startX + i * 20,
                baseY: y,
                offset: Math.random() * Math.PI * 2
            });
        }
        return points;
    }

    static renderTree(ctx, tree, camera) {
        const x = tree.x - camera.x;
        const y = tree.y - camera.y;

        ctx.fillStyle = '#1a1f2e'; // Dark tree color
        ctx.strokeStyle = '#1a1f2e';
        
        ctx.beginPath();
        ctx.moveTo(x - tree.width / 2, y);
        ctx.lineTo(x - tree.width / 4 + tree.height * tree.lean, y - tree.height);
        ctx.lineTo(x + tree.width / 4 + tree.height * tree.lean, y - tree.height);
        ctx.lineTo(x + tree.width / 2, y);
        ctx.fill();

        tree.branches.forEach(b => {
            const bx = x + (tree.height * b.heightRatio) * tree.lean;
            const by = y - tree.height * b.heightRatio;
            
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.lineTo(bx + Math.cos(b.angle) * b.length, by + Math.sin(b.angle) * b.length);
            ctx.lineWidth = 4;
            ctx.stroke();
        });
    }

    static renderRock(ctx, rock, camera) {
        const x = rock.x - camera.x;
        const y = rock.y - camera.y;

        ctx.fillStyle = '#2a2f3e';
        ctx.beginPath();
        if (rock.points.length > 0) {
            ctx.moveTo(x + rock.points[0].x, y + rock.points[0].y);
            for (let i = 1; i < rock.points.length; i++) {
                ctx.lineTo(x + rock.points[i].x, y + rock.points[i].y);
            }
        }
        ctx.closePath();
        ctx.fill();
    }

    static renderWater(ctx, waterPoints, camera, time) {
        if (waterPoints.length === 0) return;

        ctx.fillStyle = 'rgba(0, 50, 100, 0.6)';
        
        ctx.beginPath();
        ctx.moveTo(waterPoints[0].x - camera.x, waterPoints[0].baseY - camera.y);

        for (let i = 0; i < waterPoints.length; i++) {
            const p = waterPoints[i];
            const waveY = p.baseY + Math.sin(time * 0.003 + p.offset) * 5;
            ctx.lineTo(p.x - camera.x, waveY - camera.y);
        }

        // Complete the shape downwards
        const lastP = waterPoints[waterPoints.length - 1];
        ctx.lineTo(lastP.x - camera.x, lastP.baseY + 500 - camera.y); // Arbitrary depth
        ctx.lineTo(waterPoints[0].x - camera.x, waterPoints[0].baseY + 500 - camera.y);
        
        ctx.fill();
    }

    static renderCrystal(ctx, crystal, camera) {
        const x = crystal.x - camera.x;
        const y = crystal.y - camera.y;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(crystal.angle);

        // Glow
        ctx.shadowColor = `hsl(${crystal.hue}, 100%, 70%)`;
        ctx.shadowBlur = 15;
        
        ctx.fillStyle = `hsl(${crystal.hue}, 80%, 85%)`;
        
        ctx.beginPath();
        ctx.moveTo(0, -crystal.height / 2);
        ctx.lineTo(crystal.width / 2, 0);
        ctx.lineTo(0, crystal.height / 2);
        ctx.lineTo(-crystal.width / 2, 0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}
