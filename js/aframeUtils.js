/**
 * Shared A-Frame utilities used by the component, mixin and global systems.
 */

export const COMPONENT_LIBRARY = {
    geometry: {
        label: 'Geometry',
        category: 'Core',
        properties: {
            primitive: { type: 'select', options: ['box', 'sphere', 'cylinder', 'cone', 'plane', 'torus', 'torusKnot', 'circle', 'ring', 'triangle'], default: 'box' },
            width: { type: 'number', default: 1 },
            height: { type: 'number', default: 1 },
            depth: { type: 'number', default: 1 },
            radius: { type: 'number', default: 0.5 },
            'radius-inner': { type: 'number', default: 0.5 },
            'radius-outer': { type: 'number', default: 1 },
            'radius-tubular': { type: 'number', default: 0.1 }
        }
    },
    material: {
        label: 'Material',
        category: 'Core',
        properties: {
            color: { type: 'color', default: '#4CC3D9' },
            metalness: { type: 'number', default: 0.3, min: 0, max: 1, step: 0.05 },
            roughness: { type: 'number', default: 0.5, min: 0, max: 1, step: 0.05 },
            opacity: { type: 'number', default: 1, min: 0, max: 1, step: 0.05 },
            transparent: { type: 'boolean', default: false },
            src: { type: 'text', default: '' },
            side: { type: 'select', options: ['front', 'back', 'double'], default: 'front' }
        }
    },
    animation: {
        label: 'Animation',
        category: 'Animation',
        properties: {
            property: { type: 'select', options: ['position', 'rotation', 'scale', 'material.color'], default: 'rotation' },
            from: { type: 'text', default: '0 0 0' },
            to: { type: 'text', default: '0 360 0' },
            dur: { type: 'number', default: 2000 },
            delay: { type: 'number', default: 0 },
            easing: { type: 'select', options: ['linear', 'easeIn', 'easeOut', 'easeInOut', 'elastic', 'back'], default: 'linear' },
            loop: { type: 'boolean', default: true },
            dir: { type: 'select', options: ['normal', 'alternate', 'reverse'], default: 'normal' },
            startEvents: { type: 'text', default: 'start-anim' },
            pauseEvents: { type: 'text', default: 'stop-anim' }
        }
    },
    'animation-mixer': {
        label: 'Animation Mixer',
        category: 'Animation',
        properties: {
            clip: { type: 'text', default: '*' },
            loop: { type: 'select', options: ['repeat', 'once', 'pingpong'], default: 'repeat' },
            'cross-fade-duration': { type: 'number', default: 0.01 }
        }
    },
    sound: {
        label: 'Sound',
        category: 'Media',
        properties: {
            src: { type: 'text', default: '' },
            autoplay: { type: 'boolean', default: false },
            loop: { type: 'boolean', default: false },
            volume: { type: 'number', default: 1, min: 0, max: 1, step: 0.05 },
            positional: { type: 'boolean', default: true }
        }
    },
    light: {
        label: 'Light',
        category: 'Environment',
        properties: {
            type: { type: 'select', options: ['ambient', 'directional', 'point', 'spot', 'hemisphere'], default: 'point' },
            color: { type: 'color', default: '#ffffff' },
            intensity: { type: 'number', default: 1 },
            distance: { type: 'number', default: 0 },
            angle: { type: 'number', default: 1.05 },
            penumbra: { type: 'number', default: 0 },
            decay: { type: 'number', default: 2 }
        }
    },
    shadow: {
        label: 'Shadow',
        category: 'Environment',
        properties: {
            cast: { type: 'boolean', default: true },
            receive: { type: 'boolean', default: false }
        }
    },
    'look-controls': {
        label: 'Look Controls',
        category: 'Controls',
        properties: {
            'reverse-mouse-drag': { type: 'boolean', default: false },
            'touch-enabled': { type: 'boolean', default: true },
            'magic-window-tracking-enabled': { type: 'boolean', default: true }
        }
    },
    'wasd-controls': {
        label: 'WASD Controls',
        category: 'Controls',
        properties: {
            acceleration: { type: 'number', default: 65 },
            fly: { type: 'boolean', default: false }
        }
    },
    'orbit-controls': {
        label: 'Orbit Controls',
        category: 'Controls',
        properties: {
            target: { type: 'text', default: '0 0 0' },
            'min-distance': { type: 'number', default: 1 },
            'max-distance': { type: 'number', default: 1000 }
        }
    },
    cursor: {
        label: 'Cursor',
        category: 'Interaction',
        properties: {
            fuse: { type: 'boolean', default: false },
            'fuse-timeout': { type: 'number', default: 1500 },
            color: { type: 'color', default: '#ffffff' },
            'ray-origin': { type: 'text', default: '0 0 0' }
        }
    },
    raycaster: {
        label: 'Raycaster',
        category: 'Interaction',
        properties: {
            objects: { type: 'text', default: '' },
            far: { type: 'number', default: 1000 },
            near: { type: 'number', default: 0 }
        }
    },
    'super-hands': {
        label: 'Super Hands',
        category: 'Interaction',
        properties: {
            'collider-event': { type: 'text', default: 'collisions' },
            'grab-start-event': { type: 'text', default: 'grab-start' },
            'grab-end-event': { type: 'text', default: 'grab-end' }
        }
    },
    environment: {
        label: 'Environment',
        category: 'Environment',
        properties: {
            preset: { type: 'select', options: ['default', 'forest', 'tron', 'starry', 'contact', 'egypt', 'checkerboard', 'osiris', 'dream', 'volcano', 'arches', 'japan', 'dream'], default: 'default' },
            'sky-type': { type: 'select', options: ['atmosphere', 'gradient', 'none'], default: 'atmosphere' },
            lighting: { type: 'select', options: ['distant', 'point', 'none'], default: 'distant' },
            shadow: { type: 'boolean', default: true },
            fog: { type: 'number', default: 0.5, min: 0, max: 1, step: 0.05 }
        }
    },
    text: {
        label: 'Text',
        category: 'Core',
        properties: {
            value: { type: 'text', default: 'Hello A-Frame!' },
            align: { type: 'select', options: ['left', 'center', 'right'], default: 'center' },
            color: { type: 'color', default: '#ffffff' },
            width: { type: 'number', default: 2 },
            baseline: { type: 'select', options: ['top', 'center', 'bottom'], default: 'center' }
        }
    },
    visible: {
        label: 'Visibility',
        category: 'Core',
        properties: {
            value: { type: 'boolean', default: true }
        }
    },
    'studio-behavior': {
        label: 'Behaviour / Trigger',
        category: 'Interaction',
        properties: {
            actions: { type: 'textarea', default: '[]' }
        }
    },
    'studio-particles': {
        label: 'Particle Effect',
        category: 'Effects',
        properties: {
            count: { type: 'number', default: 180 },
            color: { type: 'color', default: '#7dd3fc' },
            size: { type: 'number', default: 0.09, step: 0.01 },
            speed: { type: 'number', default: 0.7, step: 0.1 },
            spread: { type: 'number', default: 4 },
            height: { type: 'number', default: 5 },
            opacity: { type: 'number', default: 0.85, min: 0, max: 1, step: 0.05 }
        }
    }
};

const COMPONENT_ALIASES = {
    'look-controls': 'look-controls',
    'wasd-controls': 'wasd-controls',
    'orbit-controls': 'orbit-controls',
    'animation-mixer': 'animation-mixer'
};

const COMPONENT_CATEGORIES = {
    Core: ['position', 'rotation', 'scale', 'visible', 'geometry', 'material', 'background', 'text'],
    Animation: ['animation', 'animation-mixer'],
    Controls: ['look-controls', 'wasd-controls', 'orbit-controls', 'teleport-controls', 'blink-controls', 'movement-controls', 'tracked-controls', 'hand-controls', 'hand-tracking-controls', 'laser-controls', 'vive-controls', 'oculus-touch-controls', 'windows-motion-controls', 'daydream-controls', 'gearvr-controls', 'magic-window-controls', 'keyboard-controls', 'gamepad-controls'],
    Interaction: ['cursor', 'raycaster', 'super-hands', 'grabbable', 'draggable', 'stretchable', 'clickable', 'sphere-collider', 'collision', 'event-set', 'studio-behavior'],
    Media: ['sound', 'src', 'gltf-model', 'obj-model', 'video', 'image'],
    Environment: ['light', 'shadow', 'fog', 'environment', 'sky', 'daylight'],
    Effects: ['studio-particles', 'particle-system', 'bloom', 'blur', 'screenshot', 'stats', 'debug']
};

function inferComponentCategory(name) {
    for (const [category, names] of Object.entries(COMPONENT_CATEGORIES)) {
        if (names.includes(name)) return category;
    }
    return 'A-Frame';
}

function prettifyComponentName(name) {
    return name
        .replace(/^animation__/, 'Animation: ')
        .replace(/__/g, ': ')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, letter => letter.toUpperCase());
}

export function isSinglePropertyComponent(name) {
    const registered = typeof window !== 'undefined' ? window.AFRAME?.components?.[name] : null;
    return !!registered?.schema && typeof registered.schema.type === 'string';
}

export function getAvailableComponents() {
    const available = new Map();

    Object.entries(COMPONENT_LIBRARY).forEach(([name, definition]) => {
        available.set(name, {
            name,
            label: definition.label || name,
            category: definition.category || 'Other'
        });
    });

    // Include every component registered with A-Frame, including components
    // loaded by extras, environment, physics and the app's own features.
    const registered = typeof window !== 'undefined' ? (window.AFRAME?.components || {}) : {};
    Object.keys(registered).forEach(name => {
        if (available.has(name)) return;
        available.set(name, {
            name,
            label: prettifyComponentName(name),
            category: inferComponentCategory(name)
        });
    });

    return Array.from(available.values()).sort((a, b) => {
        if (a.category !== b.category) return a.category.localeCompare(b.category);
        return a.label.localeCompare(b.label);
    });
}

export function getComponentDefinition(name) {
    return COMPONENT_LIBRARY[COMPONENT_ALIASES[name] || name] || null;
}

export function parseComponentString(value) {
    if (value === null || value === undefined || value === '') return {};
    if (typeof value === 'object') return { ...value };

    return String(value).split(';').reduce((result, pair) => {
        const separator = pair.indexOf(':');
        if (separator === -1) return result;
        const key = pair.slice(0, separator).trim();
        const rawValue = pair.slice(separator + 1).trim();
        if (!key) return result;
        result[key] = parseScalar(rawValue);
        return result;
    }, {});
}

export function parseScalar(value) {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;
    if (trimmed === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
    return trimmed;
}

export function stringifyComponentData(data) {
    if (data === null || data === undefined) return '';
    if (typeof data !== 'object') return String(data);

    return Object.entries(data)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${key}: ${formatValue(value)}`)
        .join('; ');
}

export function formatValue(value) {
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (value === null) return 'null';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}

export function getComponentData(element, name) {
    if (!element) return {};
    const value = element.getAttribute(name);
    if (isSinglePropertyComponent(name)) {
        return { value };
    }
    return parseComponentString(value);
}

export function setComponentProperty(element, name, property, value) {
    if (!element) return;
    if (isSinglePropertyComponent(name) && property === 'value') {
        element.setAttribute(name, value);
        return;
    }
    const data = getComponentData(element, name);
    data[property] = value;
    element.setAttribute(name, data);
}

export function removeComponentProperty(element, name, property) {
    if (!element) return;
    const data = getComponentData(element, name);
    delete data[property];
    element.setAttribute(name, data);
}

export function normalizeComponentData(name, data) {
    const definition = getComponentDefinition(name);
    if (!definition) return { ...data };

    const normalized = { ...data };
    Object.entries(definition.properties || {}).forEach(([property, propertyDefinition]) => {
        if (normalized[property] === undefined && propertyDefinition.default !== undefined) {
            normalized[property] = propertyDefinition.default;
        }
        if (normalized[property] !== undefined) {
            const type = propertyDefinition.type;
            if (type === 'number') normalized[property] = Number(normalized[property]) || 0;
            else if (type === 'boolean') normalized[property] = normalized[property] === true || normalized[property] === 'true';
        }
    });
    return normalized;
}

export function getComponentSchema(name) {
    const definition = getComponentDefinition(name);
    if (definition) return definition.properties || {};

    // Fall back to the schema registered by A-Frame when available.
    const registered = typeof window !== 'undefined' ? window.AFRAME?.components?.[name] : null;
    if (registered?.schema) {
        const mapType = (schemaType) => schemaType === 'color' ? 'color'
            : schemaType === 'boolean' ? 'boolean'
            : schemaType === 'number' || schemaType === 'int' ? 'number'
            : 'text';

        // Single-property components (visible, src, etc.) expose one value.
        if (typeof registered.schema.type === 'string') {
            return {
                value: {
                    type: mapType(registered.schema.type),
                    default: registered.schema.default
                }
            };
        }

        const schema = {};
        Object.entries(registered.schema).forEach(([property, propertySchema]) => {
            if (!propertySchema || propertySchema.type === undefined) return;
            schema[property] = {
                type: mapType(propertySchema.type),
                default: propertySchema.default
            };
        });
        return schema;
    }

    return {};
}

export function escapeHtmlAttribute(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

export function safeId(value) {
    return String(value || '')
        .trim()
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
