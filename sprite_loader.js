export class SpriteLoader {
    constructor() {
        this.cache = new Map();
    }

    load_sprite(id, filepath) {
        if (this.cache.has(filepath)) {
            console.warn("reloading image", filepath);
        }
        let load_promise = new Promise((resolve) => {
            let img = new Image();
            let this_cache = this.cache;
            img.addEventListener('load', function () {
                this_cache.set(filepath, img);
                resolve([id, [img.width, img.height]]);
            }, false);
            img.src = filepath;
        });
        return load_promise;
    }

    get_sprite(filepath) {
        if (!this.cache.has(filepath)) {
            console.error("image not loaded", filepath);
            return null;
        }
        return this.cache.get(filepath);
    }
}