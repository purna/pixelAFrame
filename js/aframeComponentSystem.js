import {
    getAvailableComponents,
    getComponentDefinition,
    getComponentData,
    getComponentSchema,
    normalizeComponentData,
    setComponentProperty,
    removeComponentProperty,
    parseComponentString,
    parseScalar,
    isSinglePropertyComponent,
    stringifyComponentData
} from './aframeUtils.js';

/**
 * A-Frame Component System
 *
 * Provides one place to inspect, add, remove and edit components on A-Frame
 * entities. All edits go through element.setAttribute so A-Frame updates live.
 */
export class AFrameComponentSystem {
    constructor(app) {
        this.app = app;
    }

    getAvailableComponents() {
        return getAvailableComponents();
    }

    getDefinition(name) {
        return getComponentDefinition(name);
    }

    getSchema(name) {
        return getComponentSchema(name);
    }

    getComponents(element) {
        if (!element) return [];

        const names = new Set();
        Array.from(element.attributes || []).forEach(attribute => {
            const name = attribute.name;
            if (['id', 'class', 'mixin', 'position', 'rotation', 'scale', 'visible'].includes(name)) return;
            if (this.getDefinition(name) || window.AFRAME?.components?.[name]) {
                names.add(name);
            }
        });

        return Array.from(names).map(name => ({
            name,
            label: this.getDefinition(name)?.label || name,
            category: this.getDefinition(name)?.category || 'Other',
            data: getComponentData(element, name)
        }));
    }

    addComponent(element, name, data = {}) {
        if (!element || !name) return false;
        if (isSinglePropertyComponent(name)) {
            const value = data && typeof data === 'object' && 'value' in data ? data.value : data;
            element.setAttribute(name, value === undefined ? '' : value);
            return true;
        }
        const normalized = normalizeComponentData(name, parseComponentString(data));
        element.setAttribute(name, normalized);
        return true;
    }

    removeComponent(element, name) {
        if (!element || !name) return;
        element.removeAttribute(name);
    }

    setProperty(element, name, property, value) {
        if (!element || !name || !property) return;
        setComponentProperty(element, name, property, value);
    }

    removeProperty(element, name, property) {
        if (!element || !name || !property) return;
        removeComponentProperty(element, name, property);
    }

    getData(element, name) {
        return getComponentData(element, name);
    }

    setData(element, name, data) {
        if (!element || !name) return;
        element.setAttribute(name, data);
    }

    setRawData(element, name, rawText) {
        if (!element || !name) return;
        const parsed = parseComponentString(rawText);
        // If the user typed JSON, allow it to replace the component data.
        if (rawText.trim().startsWith('{')) {
            try {
                element.setAttribute(name, JSON.parse(rawText));
                return;
            } catch (err) {
                // Fall through to the regular A-Frame component parser.
            }
        }
        // Single-property components (visible, src, ...) accept a raw value.
        if (isSinglePropertyComponent(name) || !rawText.includes(':')) {
            element.setAttribute(name, parseScalar(rawText));
            return;
        }
        element.setAttribute(name, parsed);
    }

    serialize(element, name) {
        return stringifyComponentData(getComponentData(element, name));
    }
}
