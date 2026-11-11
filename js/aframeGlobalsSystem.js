import { stringifyComponentData, escapeHtmlAttribute } from './aframeUtils.js';

/**
 * Scene-wide "global" settings for the A-Frame world.
 *
 * Globals are components attached to <a-scene> rather than to an individual
 * entity: fog, shadows, background, environment and the VR UI.
 */
export const GLOBAL_LIBRARY = {
    fog: {
        label: 'Fog',
        properties: {
            type: { type: 'select', options: ['linear', 'exponential'], default: 'exponential' },
            color: { type: 'color', default: '#1a1a2e' },
            density: { type: 'number', default: 0.028, min: 0, max: 0.2, step: 0.002 },
            near: { type: 'number', default: 1 },
            far: { type: 'number', default: 100 }
        }
    },
    shadow: {
        label: 'Shadows',
        properties: {
            type: { type: 'select', options: ['basic', 'pcf', 'pcfsoft'], default: 'pcfsoft' }
        }
    },
    background: {
        label: 'Background',
        properties: {
            color: { type: 'color', default: '#1a1a2e' },
            transparent: { type: 'boolean', default: false }
        }
    },
    environment: {
        label: 'Environment',
        properties: {
            preset: { type: 'select', options: ['default', 'forest', 'tron', 'starry', 'contact', 'egypt', 'checkerboard', 'osiris', 'dream', 'volcano', 'arches', 'japan'], default: 'default' },
            'sky-type': { type: 'select', options: ['atmosphere', 'gradient', 'none'], default: 'atmosphere' },
            lighting: { type: 'select', options: ['distant', 'point', 'none'], default: 'distant' }
        }
    },
    'vr-mode-ui': {
        label: 'VR UI',
        properties: {
            enabled: { type: 'boolean', default: true }
        }
    }
};

export class AFrameGlobalsSystem {
    constructor(app) {
        this.app = app;
    }

    getScene() {
        return document.getElementById('aframe-scene');
    }

    getDefinitions() {
        return Object.entries(GLOBAL_LIBRARY).map(([name, definition]) => ({
            name,
            label: definition.label,
            properties: definition.properties
        }));
    }

    get(name) {
        const scene = this.getScene();
        if (!scene || !scene.hasAttribute(name)) return null;
        const value = scene.getAttribute(name);
        return typeof value === 'object' ? { ...value } : value;
    }

    isEnabled(name) {
        const scene = this.getScene();
        return !!scene?.hasAttribute(name);
    }

    set(name, data) {
        const scene = this.getScene();
        if (!scene) return false;
        scene.setAttribute(name, data);
        this.notify(name, data);
        return true;
    }

    remove(name) {
        const scene = this.getScene();
        if (!scene) return;
        scene.removeAttribute(name);
        this.notify(name, null);
    }

    toggle(name, enabled, defaults = {}) {
        if (enabled) this.set(name, defaults);
        else this.remove(name);
    }

    setFog(options) {
        this.set('fog', {
            type: options.type || 'exponential',
            color: options.color || '#1a1a2e',
            density: Number(options.density ?? 0.028)
        });
    }

    setShadows(enabled, type = 'pcfsoft') {
        const scene = this.getScene();
        if (!scene) return;
        if (enabled) {
            scene.setAttribute('shadow', 'type', type);
            scene.querySelectorAll('a-light').forEach(light => {
                light.setAttribute('shadow', 'cast', true);
            });
        } else {
            scene.removeAttribute('shadow');
            scene.querySelectorAll('a-light').forEach(light => {
                light.removeAttribute('shadow');
            });
        }
        this.notify('shadow', enabled ? { type } : null);
    }

    getExportAttributes() {
        const scene = this.getScene();
        if (!scene) return '';

        return ['fog', 'shadow', 'background', 'environment', 'vr-mode-ui']
            .map(name => {
                const attr = scene.attributes.getNamedItem(name);
                if (!attr) return '';
                return ` ${name}="${escapeHtmlAttribute(attr.value)}"`;
            })
            .join('');
    }

    serialize(name) {
        return stringifyComponentData(this.get(name) || {});
    }

    notify(name, value) {
        window.dispatchEvent(new CustomEvent('aframe-global-changed', {
            detail: { name, value }
        }));
    }
}
