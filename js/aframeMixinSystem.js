import { safeId, stringifyComponentData, escapeHtmlAttribute } from './aframeUtils.js';

/**
 * A-Frame Mixin System
 *
 * Mixins are reusable bundles of components stored in <a-assets>. Students can
 * create a mixin from an element, apply it to other elements, edit it or remove
 * it without touching the HTML source.
 */
export class AFrameMixinSystem {
    constructor(app) {
        this.app = app;
        this.mixins = [];
        this.loadFromScene();
    }

    getScene() {
        return document.getElementById('aframe-scene');
    }

    getAssets() {
        const scene = this.getScene();
        if (!scene) return null;
        let assets = scene.querySelector('a-assets');
        if (!assets) {
            assets = document.createElement('a-assets');
            scene.insertBefore(assets, scene.firstChild);
        }
        return assets;
    }

    createMixin({ name, components = {}, id = null } = {}) {
        const mixin = {
            id: id || 'mixin-' + safeId(name || 'mixin') + '-' + Date.now(),
            name: name || 'New Mixin',
            components: { ...components }
        };
        this.mixins.push(mixin);
        this.syncScene();
        return mixin;
    }

    getMixin(id) {
        return this.mixins.find(mixin => mixin.id === id) || null;
    }

    getMixins() {
        return this.mixins;
    }

    updateMixin(id, updates = {}) {
        const mixin = this.getMixin(id);
        if (!mixin) return null;
        Object.assign(mixin, updates, {
            components: updates.components ? { ...updates.components } : mixin.components
        });
        this.syncScene();
        return mixin;
    }

    deleteMixin(id) {
        const index = this.mixins.findIndex(mixin => mixin.id === id);
        if (index === -1) return false;
        this.mixins.splice(index, 1);
        this.syncScene();
        return true;
    }

    /**
     * Capture the reusable component values from an existing element.
     * Transform and identity attributes are intentionally excluded.
     */
    createFromElement(element, name = null) {
        if (!element) return null;

        const ignored = new Set(['id', 'class', 'mixin', 'position', 'rotation', 'scale', 'visible']);
        const components = {};

        Array.from(element.attributes || []).forEach(attribute => {
            if (ignored.has(attribute.name)) return;
            components[attribute.name] = attribute.value;
        });

        return this.createMixin({
            name: name || (element.id ? element.id + ' Mixin' : 'Element Mixin'),
            components
        });
    }

    applyToElement(element, id) {
        if (!element) return false;
        const mixin = this.getMixin(id);
        if (!mixin) return false;

        const existing = (element.getAttribute('mixin') || '')
            .split(/\s+/)
            .filter(Boolean);
        if (!existing.includes(id)) existing.push(id);
        element.setAttribute('mixin', existing.join(' '));
        return true;
    }

    removeFromElement(element, id) {
        if (!element) return;
        const remaining = (element.getAttribute('mixin') || '')
            .split(/\s+/)
            .filter(name => name && name !== id);
        if (remaining.length) element.setAttribute('mixin', remaining.join(' '));
        else element.removeAttribute('mixin');
    }

    getAppliedMixinIds(element) {
        if (!element) return [];
        return (element.getAttribute('mixin') || '')
            .split(/\s+/)
            .filter(Boolean);
    }

    syncScene() {
        const assets = this.getAssets();
        if (!assets) return;

        assets.querySelectorAll('a-mixin[data-studio-mixin]').forEach(element => element.remove());

        this.mixins.forEach(mixin => {
            const element = document.createElement('a-mixin');
            element.id = mixin.id;
            element.dataset.studioMixin = 'true';

            Object.entries(mixin.components || {}).forEach(([componentName, data]) => {
                const value = typeof data === 'string' ? data : stringifyComponentData(data);
                if (value) element.setAttribute(componentName, value);
            });

            assets.appendChild(element);
        });
    }

    loadFromScene() {
        // Mixins are recreated from this.mixins on every sync, so there is
        // nothing to load from the DOM unless a scene was imported.
        this.mixins = [];
    }

    getExportHTML() {
        return this.mixins.map(mixin => {
            const attrs = Object.entries(mixin.components || {})
                .map(([name, value]) => {
                    const serialized = typeof value === 'string' ? value : stringifyComponentData(value);
                    return ` ${name}="${escapeHtmlAttribute(serialized)}"`;
                })
                .join('');
            return `            <a-mixin id="${escapeHtmlAttribute(mixin.id)}"${attrs}></a-mixin>`;
        }).join('\n');
    }
}
