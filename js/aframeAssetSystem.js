import { safeId, escapeHtmlAttribute } from './aframeUtils.js';

function svgTexture(title, background, pattern) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
        <rect width="256" height="256" fill="${background}"/>
        ${pattern}
        <text x="128" y="246" font-family="Arial" font-size="11" fill="rgba(255,255,255,.7)" text-anchor="middle">${title}</text>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function wavDataUrl(duration, sampleAt, sampleRate = 16000) {
    const samples = Math.floor(duration * sampleRate);
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    const write = (offset, text) => {
        for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
    };
    write(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    write(8, 'WAVE');
    write(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    write(36, 'data');
    view.setUint32(40, samples * 2, true);
    for (let i = 0; i < samples; i++) {
        const t = i / sampleRate;
        const sample = Math.max(-1, Math.min(1, sampleAt(t, duration)));
        view.setInt16(44 + i * 2, sample * 32767, true);
    }
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 8192) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
    }
    return 'data:audio/wav;base64,' + btoa(binary);
}

/**
 * A-Frame Asset System
 *
 * Manages images, panoramas, videos, audio and models in <a-assets>, so the
 * same asset can be reused by many entities and is included in exports.
 */
export class AFrameAssetSystem {
    constructor(app) {
        this.app = app;
        this.assets = this.loadStoredAssets();
        this.migrateStoredAssets();
        this.seedExampleAssets();
        this.syncScene();
    }

    loadStoredAssets() {
        try {
            const saved = JSON.parse(localStorage.getItem('pixelAFrame-asset-library') || '[]');
            return Array.isArray(saved) ? saved : [];
        } catch (err) {
            return [];
        }
    }

    migrateStoredAssets() {
        let changed = false;
        this.assets.forEach(asset => {
            if (asset.name === 'Blast VFX Reference' && /w3schools\.com/i.test(asset.src || '')) {
                asset.src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
                changed = true;
            }
        });
        if (changed) this.saveStoredAssets();
    }

    saveStoredAssets() {
        try {
            localStorage.setItem('pixelAFrame-asset-library', JSON.stringify(this.assets));
        } catch (err) {
            console.warn('Could not save asset library', err);
        }
    }

    seedExampleAssets() {
        const seedKey = 'pixelAFrame-example-assets-seeded';
        const seedVersion = '2';
        if (localStorage.getItem(seedKey) === seedVersion) return;

        const examples = [
            { name: 'Grass Ground', type: 'image', src: svgTexture('Grass Ground', '#3f7d20', '<path d="M0 20 L12 6 M20 40 L34 18 M60 14 L74 2 M110 36 L124 12 M160 20 L176 4 M210 44 L226 18" stroke="#74b843" stroke-width="3"/><path d="M16 80 L32 58 M70 96 L86 70 M130 78 L148 56 M188 92 L204 68" stroke="#2f6518" stroke-width="3"/><path d="M0 130 L16 110 M54 144 L72 118 M120 132 L138 108 M190 150 L210 124" stroke="#8bcf55" stroke-width="2"/>') },
            { name: 'Concrete Wall', type: 'image', src: svgTexture('Concrete Wall', '#8b8f96', '<g stroke="#666b72" stroke-width="2"><path d="M0 64 H256 M0 128 H256 M0 192 H256"/><path d="M64 0 V64 M192 0 V64 M128 64 V128 M32 128 V192 M224 128 V192 M96 192 V256"/></g><g fill="rgba(255,255,255,.12)"><circle cx="40" cy="36" r="5"/><circle cx="180" cy="98" r="3"/><circle cx="100" cy="160" r="6"/><circle cx="220" cy="220" r="4"/></g>') },
            { name: 'Rusted Metal', type: 'image', src: svgTexture('Rusted Metal', '#8a4b2a', '<g fill="#b85c2e"><circle cx="40" cy="48" r="18"/><circle cx="160" cy="80" r="26"/><circle cx="90" cy="180" r="22"/><circle cx="210" cy="210" r="16"/></g><g fill="#5c301c"><circle cx="120" cy="40" r="9"/><circle cx="220" cy="120" r="12"/><circle cx="40" cy="220" r="10"/></g>') },
            { name: 'Wood Plank', type: 'image', src: svgTexture('Wood Plank', '#9c6434', '<g stroke="#70441f" stroke-width="4"><path d="M0 52 H256 M0 104 H256 M0 156 H256 M0 208 H256"/></g><g stroke="#b97a43" stroke-width="2"><path d="M20 18 C70 8 110 30 160 18 S230 26 256 16"/><path d="M0 80 C50 68 100 92 150 78 S220 88 256 76"/><path d="M0 140 C60 126 110 150 170 136 S230 146 256 132"/></g>') },
            { name: 'UV Checker Reference', type: 'image', src: svgTexture('UV Checker', '#202020', '<g fill="#ff4fc3"><rect x="0" y="0" width="32" height="32"/><rect x="64" y="0" width="32" height="32"/><rect x="128" y="0" width="32" height="32"/><rect x="192" y="0" width="32" height="32"/><rect x="32" y="32" width="32" height="32"/><rect x="96" y="32" width="32" height="32"/><rect x="160" y="32" width="32" height="32"/><rect x="224" y="32" width="32" height="32"/><rect x="0" y="64" width="32" height="32"/><rect x="64" y="64" width="32" height="32"/><rect x="128" y="64" width="32" height="32"/><rect x="192" y="64" width="32" height="32"/></g>') },
            { name: 'Explosion VFX Reference', type: 'video', src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
            { name: 'Blast VFX Reference', type: 'video', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
            { name: 'UI Blip', type: 'audio', src: wavDataUrl(0.14, t => Math.sin(2 * Math.PI * 660 * t) * Math.exp(-t * 28) * 0.5) },
            { name: 'UI Error', type: 'audio', src: wavDataUrl(0.25, t => (Math.sin(2 * Math.PI * 180 * t) > 0 ? 0.35 : -0.35) * Math.exp(-t * 10)) },
            { name: 'Success Applause', type: 'audio', src: wavDataUrl(1.2, t => (Math.random() * 2 - 1) * Math.exp(-t * 2.2) * 0.35) },
            { name: 'Rain Loop', type: 'audio', src: wavDataUrl(1.6, t => (Math.random() * 2 - 1) * 0.12) },
            { name: 'Thunder Crack', type: 'audio', src: wavDataUrl(1.4, t => (Math.random() * 2 - 1) * Math.exp(-t * 1.8) * (0.45 + Math.sin(2 * Math.PI * 38 * t) * 0.25)) },
            { name: 'Forest Birds', type: 'audio', src: wavDataUrl(1.5, t => Math.sin(2 * Math.PI * (900 + 500 * Math.sin(2 * Math.PI * 3 * t)) * t) * Math.exp(-((t % 0.5) * 12)) * 0.25) }
        ];

        examples.forEach(example => {
            if (!this.assets.some(asset => asset.name === example.name)) {
                this.addAsset(example);
            }
        });

        // Seed reusable game palette colours once.
        try {
            const colorKey = 'pixelAFrame-color-assets';
            const existingColors = JSON.parse(localStorage.getItem(colorKey) || '[]');
            const exampleColors = [
                ['Player Cyan', '#22d3ee'], ['Enemy Red', '#ef4444'], ['Coin Gold', '#f59e0b'],
                ['Health Green', '#22c55e'], ['Mana Blue', '#3b82f6'], ['Magic Purple', '#a855f7'],
                ['Stone Grey', '#94a3b8'], ['Lava Orange', '#f97316'], ['Toxic Green', '#84cc16'],
                ['Neon Pink', '#ec4899'], ['Night Sky', '#0f172a'], ['UI Slate', '#334155']
            ].map(([name, color]) => ({ name, color }));
            const merged = [...existingColors];
            exampleColors.forEach(color => {
                if (!merged.some(item => item.name === color.name)) merged.push(color);
            });
            localStorage.setItem(colorKey, JSON.stringify(merged));
        } catch (err) {
            console.warn('Could not seed example colours', err);
        }

        localStorage.setItem(seedKey, seedVersion);
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
        this.saveStoredAssets();
        this.syncScene();
        this.notify('asset-added', asset);
        return asset;
    }

    updateAsset(id, updates = {}) {
        const asset = this.getAsset(id);
        if (!asset) return null;
        Object.assign(asset, updates);
        if (updates.src || updates.type || updates.name) {
            this.saveStoredAssets();
            this.syncScene();
            this.notify('asset-updated', asset);
        }
        return asset;
    }

    removeAsset(id) {
        const index = this.assets.findIndex(asset => asset.id === id);
        if (index === -1) return false;
        this.assets.splice(index, 1);
        this.saveStoredAssets();
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
            if (mime.includes('svg')) return '.svg';
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
