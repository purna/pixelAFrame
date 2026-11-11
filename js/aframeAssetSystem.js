import { safeId, escapeHtmlAttribute } from './aframeUtils.js';

/**
 * A-Frame Asset System
 *
 * Manages images, panoramas, videos, audio and models in <a-assets>, so the
 * same asset can be reused by many entities and is included in exports.
 */
export class AFrameAssetSystem {
    constructor(app) {
        this.app = app;
        this.assets = [];
        this.syncScene();
    }

    getScene() {
        return document.getElementById('aframe-scene');
    }

    getAssetsContainer() {
        const scene = this.getScene();
        if (!scene) return null;
        let assets = scene.querySelector('a-assets');
        if (!assets) {
            assets = document.createElement('a-assets');
            scene.insertBefore(assets, scene.firstChild);
        }
        return assets;
    }

    getAssets() {
        return this.assets;
    }

    getAsset(id) {
        return this.assets.find(asset => asset.id === id) || null;
    }

    createUniqueId(base) {
        const clean = safeId(base || 'asset') || 'asset';
        let id = clean;
        let counter = 2;
        while (this.getAsset(id) || document.getElementById(id)) {
            id = `${clean}-${counter++}`;
        }
        return id;
    }

    addAsset({ name, type = 'image', src = '', id = null } = {}) {
        if (!src) return null;
        const asset = {
            id: id || this.createUniqueId(name || type),
            name: name || id || type,
            type,
            src
        };
        this.assets.push(asset);
        this.syncScene();
        this.notify('asset-added', asset);
        return asset;
    }

    updateAsset(id, updates = {}) {
        const asset = this.getAsset(id);
        if (!asset) return null;
        Object.assign(asset, updates);
        if (updates.src || updates.type || updates.name) {
            this.syncScene();
            this.notify('asset-updated', asset);
        }
        return asset;
    }

    removeAsset(id) {
        const index = this.assets.findIndex(asset => asset.id === id);
        if (index === -1) return false;
        this.assets.splice(index, 1);
        this.syncScene();
        this.notify('asset-removed', { id });
        return true;
    }

    getElementTag(type) {
        switch (type) {
            case 'video': return 'video';
            case 'audio': return 'audio';
            case 'model': return 'a-asset-item';
            default: return 'img';
        }
    }

    syncScene() {
        const container = this.getAssetsContainer();
        if (!container) return;

        container.querySelectorAll('[data-studio-asset]').forEach(element => element.remove());

        this.assets.forEach(asset => {
            const element = document.createElement(this.getElementTag(asset.type));
            element.id = asset.id;
            element.dataset.studioAsset = 'true';
            element.setAttribute('src', asset.src);

            if (asset.type === 'video') {
                element.setAttribute('preload', 'auto');
                element.setAttribute('crossorigin', 'anonymous');
            } else if (asset.type === 'audio') {
                element.setAttribute('preload', 'auto');
            } else if (asset.type === 'image' || asset.type === 'panorama') {
                element.setAttribute('crossorigin', 'anonymous');
            }

            container.appendChild(element);
        });
    }

    /**
     * Add an entity that uses this asset. This keeps asset management useful
     * for students: choose an asset, then place it in the world.
     */
    addAssetToScene(id) {
        const asset = this.getAsset(id);
        if (!asset || !this.app.aframeManager) return null;

        const typeMap = {
            image: 'image',
            panorama: 'sky',
            video: 'video',
            audio: 'sound',
            model: 'gltf-model'
        };
        const type = typeMap[asset.type] || 'image';
        const entity = this.app.aframeFactory.createElement(type, { src: '#' + asset.id });
        if (entity) {
            this.app.aframeManager.selectEntity(entity);
        }
        return entity;
    }

    applyAssetToSelected(id) {
        const asset = this.getAsset(id);
        const selected = this.app.aframeManager?.getSelectedEntity?.();
        if (!asset || !selected) return false;

        selected.setAttribute('src', '#' + asset.id);
        if (asset.type === 'panorama') {
            selected.setAttribute('material', 'src', '#' + asset.id);
        }
        return true;
    }

    getZipAssets() {
        const extensionFor = (asset, mime = '') => {
            if (asset.type === 'model') return '.glb';
            if (asset.type === 'audio') return mime.includes('ogg') ? '.ogg' : mime.includes('wav') ? '.wav' : '.mp3';
            if (asset.type === 'video') return mime.includes('webm') ? '.webm' : '.mp4';
            if (mime.includes('jpeg')) return '.jpg';
            if (mime.includes('png')) return '.png';
            if (mime.includes('webp')) return '.webp';
            if (mime.includes('gif')) return '.gif';
            return '.img';
        };

        return this.assets.map(asset => {
            const src = asset.src || '';
            if (src.startsWith('data:')) {
                const match = src.match(/^data:([^;,]+)?(;base64)?,(.*)$/s);
                if (match) {
                    const mime = match[1] || '';
                    return {
                        filename: safeId(asset.id || asset.name || asset.type) + extensionFor(asset, mime),
                        content: match[3],
                        base64: !!match[2]
                    };
                }
            }
            return null;
        }).filter(Boolean);
    }

    getExportHTML() {
        return this.assets.map(asset => {
            const tag = this.getElementTag(asset.type);
            return `            <${tag} id="${escapeHtmlAttribute(asset.id)}" src="${escapeHtmlAttribute(asset.src)}"></${tag}>`;
        }).join('\n');
    }

    notify(type, detail) {
        window.dispatchEvent(new CustomEvent('aframe-asset-changed', {
            detail: { type, ...detail }
        }));
    }
}
