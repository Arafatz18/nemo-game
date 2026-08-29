/**
 * AssetLoader.js – Asynchronous Image & Audio Asset Manager
 * 
 * Automatically keys out flat gray sprite sheet backgrounds to ensure
 * clean transparent rendering for sprites.
 */

export default class AssetLoader {
    constructor() {
        this.images = new Map();
        this.audio = new Map();
        this.loadedCount = 0;
        this.totalCount = 0;
    }

    loadImage(key, src, removeBackground = true) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                if (removeBackground && (key === 'nemo' || src.includes('spritesheet'))) {
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.naturalWidth || img.width || 1024;
                        canvas.height = img.naturalHeight || img.height || 228;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                        
                        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const data = imgData.data;
                        
                        // Chroma-key out the flat dark-gray background (RGB ~ 40..68)
                        // Nemo's dark body is < 32, glowing eyes/lantern > 160
                        for (let i = 0; i < data.length; i += 4) {
                            const r = data[i];
                            const g = data[i + 1];
                            const b = data[i + 2];
                            
                            // Target gray background color in the sprite sheet
                            if (r >= 38 && r <= 72 && g >= 38 && g <= 72 && b >= 38 && b <= 72) {
                                data[i + 3] = 0; // Set alpha to 0 (fully transparent)
                            }
                        }
                        
                        ctx.putImageData(imgData, 0, 0);
                        this.images.set(key, canvas);
                        this.loadedCount++;
                        resolve(canvas);
                        return;
                    } catch (e) {
                        console.warn('AssetLoader: Chroma-keying skipped (using raw image)', e);
                    }
                }
                
                this.images.set(key, img);
                this.loadedCount++;
                resolve(img);
            };
            img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
            img.src = src;
        });
    }

    loadAudio(key, src) {
        return new Promise((resolve, reject) => {
            fetch(src)
                .then(response => response.arrayBuffer())
                .then(buffer => {
                    this.audio.set(key, buffer);
                    this.loadedCount++;
                    resolve(buffer);
                })
                .catch(err => reject(new Error(`Failed to load audio: ${src}`)));
        });
    }

    getImage(key) {
        return this.images.get(key) || null;
    }

    getAudio(key) {
        return this.audio.get(key) || null;
    }

    loadAll(manifest) {
        this.totalCount = manifest.length;
        this.loadedCount = 0;
        
        const promises = manifest.map(asset => {
            if (asset.type === 'image') {
                return this.loadImage(asset.key, asset.src);
            } else if (asset.type === 'audio') {
                return this.loadAudio(asset.key, asset.src);
            }
            return Promise.resolve();
        });

        return Promise.all(promises);
    }

    getProgress() {
        if (this.totalCount === 0) return 1;
        return this.loadedCount / this.totalCount;
    }
}
