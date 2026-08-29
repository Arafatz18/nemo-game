/**
 * AssetLoader.js – Asynchronous Image & Audio Asset Manager
 */

export default class AssetLoader {
    constructor() {
        this.images = new Map();
        this.audio = new Map();
        this.loadedCount = 0;
        this.totalCount = 0;
    }

    loadImage(key, src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
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
