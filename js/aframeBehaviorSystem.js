import { DREAMWEAVER_BEHAVIORS } from './aframeDreamweaverBehaviors.js';
import { getComponentData } from './aframeUtils.js';

const number = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const vec3 = (value, fallback = { x: 0, y: 0, z: 0 }) => {
    if (value && typeof value === 'object') {
        return {
            x: number(value.x, fallback.x),
            y: number(value.y, fallback.y),
            z: number(value.z, fallback.z)
        };
    }
    const parts = String(value || '').trim().split(/\s+/).map(Number);
    return {
        x: Number.isFinite(parts[0]) ? parts[0] : fallback.x,
        y: Number.isFinite(parts[1]) ? parts[1] : fallback.y,
        z: Number.isFinite(parts[2]) ? parts[2] : fallback.z
    };
};

const toVecString = (vec) => `${vec.x} ${vec.y} ${vec.z}`;

function getActions(entity) {
    const attribute = entity.getAttribute('studio-behavior');
    if (!attribute) return [];
    try {
        const raw = typeof attribute === 'object' ? attribute.actions : attribute;
        const parsed = JSON.parse(raw || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
        return [];
    }
}

function setActions(entity, actions) {
    entity.setAttribute('studio-behavior', 'actions', JSON.stringify(actions));
}

function addAction(entity, id, action) {
    const actions = getActions(entity);
    actions.push({ ...action, _behaviorId: id });
    setActions(entity, actions);
}

function removeAction(entity, id) {
    setActions(entity, getActions(entity).filter(action => action._behaviorId !== id));
}

/**
 * Curated, classroom-friendly behaviours. Each definition has simple
 * parameters and knows which A-Frame components/actions it needs.
 */
export const BEHAVIOR_LIBRARY = {
    'toggle-visible': {
        label: 'Toggle Visible',
        icon: 'fa-eye',
        category: 'Visual State',
        description: 'Show or hide this object when it is clicked.',
        params: {
            trigger: { type: 'select', options: ['click', 'mouseenter'], default: 'click', label: 'When' },
            startHidden: { type: 'boolean', default: false, label: 'Start hidden' }
        },
        apply(entity, params, id) {
            if (params.startHidden) entity.setAttribute('visible', false);
            addAction(entity, id, { trigger: params.trigger || 'click', type: 'toggle-visibility' });
            return { actions: true };
        }
    },
    highlight: {
        label: 'Highlight',
        icon: 'fa-highlighter',
        category: 'Visual State',
        description: 'Glow a different colour when the pointer is over the object.',
        params: {
            normalColor: { type: 'color', default: '#4CC3D9', label: 'Normal colour' },
            highlightColor: { type: 'color', default: '#ffd166', label: 'Highlight colour' }
        },
        apply(entity, params, id) {
            addAction(entity, id, { trigger: 'mouseenter', type: 'set-color', value: params.highlightColor || '#ffd166' });
            addAction(entity, id, { trigger: 'mouseleave', type: 'set-color', value: params.normalColor || '#4CC3D9' });
            return { actions: true };
        }
    },
    pulse: {
        label: 'Pulse',
        icon: 'fa-heartbeat',
        category: 'Visual State',
        description: 'Gently grow and shrink the object in a loop.',
        params: {
            duration: { type: 'number', default: 1.2, min: 0.2, max: 10, step: 0.1, label: 'Duration (seconds)' },
            scaleAmount: { type: 'number', default: 10, min: 1, max: 100, step: 1, label: 'Scale amount (%)' }
        },
        apply(entity, params) {
            const attr = 'animation__studio_pulse';
            const current = vec3(entity.getAttribute('scale'), { x: 1, y: 1, z: 1 });
            const factor = 1 + number(params.scaleAmount, 10) / 100;
            entity.setAttribute(attr, {
                property: 'scale',
                from: toVecString(current),
                to: toVecString({ x: current.x * factor, y: current.y * factor, z: current.z * factor }),
                dur: number(params.duration, 1.2) * 1000,
                dir: 'alternate',
                loop: true,
                easing: 'easeInOutSine'
            });
            return { attrs: [attr] };
        }
    },
    'move-to-point': {
        label: 'Move To Point',
        icon: 'fa-arrows-alt',
        category: 'Movement',
        description: 'Move the object to a target position over time.',
        params: {
            x: { type: 'number', default: 0, label: 'Target X' },
            y: { type: 'number', default: 1, label: 'Target Y' },
            z: { type: 'number', default: -5, label: 'Target Z' },
            duration: { type: 'number', default: 2, min: 0.1, max: 30, step: 0.1, label: 'Duration (seconds)' },
            trigger: { type: 'select', options: ['click', 'auto'], default: 'click', label: 'When' }
        },
        apply(entity, params, id) {
            const attr = 'animation__studio_move';
            const current = vec3(entity.getAttribute('position'), { x: 0, y: 1, z: -3 });
            const animation = {
                property: 'position',
                from: toVecString(current),
                to: `${number(params.x, 0)} ${number(params.y, 1)} ${number(params.z, -5)}`,
                dur: number(params.duration, 2) * 1000,
                easing: 'easeInOutQuad'
            };
            if ((params.trigger || 'click') === 'click') {
                animation.startEvents = 'start-anim';
                addAction(entity, id, { trigger: 'click', type: 'start-animation' });
            } else {
                animation.startEvents = 'loaded';
            }
            entity.setAttribute(attr, animation);
            return { attrs: [attr], actions: (params.trigger || 'click') === 'click' };
        }
    },
    'rotate-loop': {
        label: 'Rotate Loop',
        icon: 'fa-sync-alt',
        category: 'Movement',
        description: 'Continuously rotate around one axis.',
        params: {
            axis: { type: 'select', options: ['x', 'y', 'z'], default: 'y', label: 'Axis' },
            speed: { type: 'number', default: 45, min: 1, max: 720, step: 1, label: 'Speed (degrees/sec)' }
        },
        apply(entity, params) {
            const attr = 'animation__studio_rotate';
            const current = vec3(entity.getAttribute('rotation'), { x: 0, y: 0, z: 0 });
            const axis = ['x', 'y', 'z'].includes(params.axis) ? params.axis : 'y';
            const target = { ...current };
            target[axis] = current[axis] + 360;
            const speed = Math.max(1, number(params.speed, 45));
            entity.setAttribute(attr, {
                property: 'rotation',
                from: toVecString(current),
                to: toVecString(target),
                dur: (360 / speed) * 1000,
                loop: true,
                easing: 'linear'
            });
            return { attrs: [attr] };
        }
    },
    'walk-in-place': {
        label: 'Walk Back and Forth',
        icon: 'fa-walking',
        category: 'Movement',
        description: 'Move forward and back along an axis, like a simple NPC patrol.',
        params: {
            distance: { type: 'number', default: 2, min: 0.5, max: 20, step: 0.5, label: 'Distance' },
            duration: { type: 'number', default: 2, min: 0.2, max: 30, step: 0.1, label: 'One-way time (seconds)' },
            axis: { type: 'select', options: ['x', 'z'], default: 'z', label: 'Direction' }
        },
        apply(entity, params = {}) {
            const attr = 'animation__studio_walk';
            const current = vec3(entity.getAttribute('position'), { x: 0, y: 1, z: -3 });
            const axis = paramsAxis(params.axis);
            const target = { ...current };
            target[axis] += number(params.distance, 2);
            entity.setAttribute(attr, {
                property: 'position',
                from: toVecString(current),
                to: toVecString(target),
                dur: number(params.duration, 2) * 1000,
                dir: 'alternate',
                loop: true,
                easing: 'linear'
            });
            return { attrs: [attr] };
        }
    },
    'grab-and-move': {
        label: 'Grab and Move',
        icon: 'fa-hand-paper',
        category: 'Interaction',
        description: 'Let the user drag the object with the pointer or controller.',
        params: {},
        apply(entity) {
            entity.setAttribute('studio-drag', 'enabled: true');
            return { attrs: ['studio-drag'] };
        }
    },
    teleport: {
        label: 'Teleport Here',
        icon: 'fa-location-arrow',
        category: 'Interaction',
        description: 'Move the viewer to this object when clicked.',
        params: {},
        apply(entity, params, id) {
            addAction(entity, id, { trigger: 'click', type: 'teleport-camera' });
            return { actions: true };
        }
    },
    'open-close': {
        label: 'Open / Close',
        icon: 'fa-door-open',
        category: 'Interaction',
        description: 'Rotate a door or panel open and closed when clicked.',
        params: {
            angle: { type: 'number', default: 90, min: 1, max: 360, step: 1, label: 'Open angle' },
            duration: { type: 'number', default: 0.9, min: 0.1, max: 10, step: 0.1, label: 'Duration (seconds)' },
            axis: { type: 'select', options: ['x', 'y', 'z'], default: 'y', label: 'Hinge axis' }
        },
        apply(entity, params) {
            entity.setAttribute('studio-open-close', {
                angle: number(params.angle, 90),
                duration: number(params.duration, 0.9) * 1000,
                axis: params.axis || 'y'
            });
            return { attrs: ['studio-open-close'] };
        }
    },
    'play-sound-on-click': {
        label: 'Play Sound',
        icon: 'fa-volume-up',
        category: 'Audio & Feedback',
        description: 'Play a short sound when the object is clicked.',
        params: {
            asset: { type: 'audio-asset', default: '', label: 'Sound asset' },
            src: { type: 'text', default: '', label: 'or Sound URL' },
            volume: { type: 'number', default: 1, min: 0, max: 1, step: 0.05, label: 'Volume' }
        },
        apply(entity, params, id) {
            const source = (params.src || '').trim() || (params.asset ? (params.asset.startsWith('#') ? params.asset : '#' + params.asset) : '');
            const addedSound = !entity.hasAttribute('sound');
            if (addedSound) {
                entity.setAttribute('sound', {
                    src: source,
                    loop: false,
                    volume: number(params.volume, 1),
                    autoplay: false
                });
            } else if (source) {
                entity.setAttribute('sound', 'src', source);
            }
            addAction(entity, id, { trigger: 'click', type: 'play-sound' });
            return { attrs: addedSound ? ['sound'] : [], actions: true };
        }
    },
    'vibrate-on-touch': {
        label: 'Vibrate',
        icon: 'fa-mobile-alt',
        category: 'Audio & Feedback',
        description: 'Give a short haptic pulse when the object is touched.',
        params: {
            duration: { type: 'number', default: 120, min: 20, max: 1000, step: 10, label: 'Duration (ms)' },
            intensity: { type: 'number', default: 0.6, min: 0, max: 1, step: 0.1, label: 'Intensity' }
        },
        apply(entity, params, id) {
            addAction(entity, id, {
                trigger: 'click',
                type: 'vibrate',
                duration: number(params.duration, 120),
                intensity: number(params.intensity, 0.6)
            });
            return { actions: true };
        }
    },
    'swap-image': {
        label: 'Swap Image',
        icon: 'fa-images',
        category: 'Visual State',
        description: 'Change a chosen image to another image. Optionally restore the original when the pointer leaves.',
        params: {
            target: { type: 'image-target', default: '', label: 'Image to swap' },
            replacementAsset: { type: 'image-asset', default: '', label: 'Swap with asset' },
            replacementUrl: { type: 'text', default: '', label: 'or image URL' },
            trigger: { type: 'select', options: ['click', 'mouseenter'], default: 'click', label: 'When' },
            preload: { type: 'boolean', default: true, label: 'Preload image' },
            restoreOnMouseOut: { type: 'boolean', default: true, label: 'Restore on hover out' }
        },
        apply(entity, params, id, app) {
            let replacement = (params.replacementUrl || params.replacementAsset || '').trim();
            if (!replacement) return { actions: false };

            // Preload remote replacement images as reusable assets so the swap
            // does not flicker while the browser downloads the new image.
            if (params.preload && !replacement.startsWith('#') && app?.assetSystem) {
                let asset = app.assetSystem.getAssets().find(item => item.src === replacement);
                if (!asset) {
                    asset = app.assetSystem.addAsset({ name: 'Swap image', type: 'image', src: replacement });
                }
                if (asset) replacement = '#' + asset.id;
            }

            const target = params.target || '';
            addAction(entity, id, {
                trigger: params.trigger || 'click',
                type: 'swap-image',
                target,
                value: replacement
            });

            if (params.restoreOnMouseOut) {
                const targetElement = target ? document.querySelector(target) : entity;
                const original = targetElement ? targetElement.getAttribute('src') : '';
                if (original) {
                    addAction(entity, id, {
                        trigger: 'mouseleave',
                        type: 'swap-image',
                        target,
                        value: original
                    });
                }
            }

            return { actions: true };
        }
    },
    'call-javascript': {
        label: 'Call JavaScript',
        icon: 'fa-code',
        category: 'Logic',
        description: 'Run a small JavaScript snippet when the object is clicked. Useful for custom classroom logic.',
        params: {
            trigger: { type: 'select', options: ['click', 'mouseenter', 'mouseleave'], default: 'click', label: 'When' },
            code: { type: 'textarea', default: 'console.log(\'Hello from A-Frame!\');', label: 'JavaScript' }
        },
        apply(entity, params, id) {
            addAction(entity, id, {
                trigger: params.trigger || 'click',
                type: 'run-code',
                value: params.code || ''
            });
            return { actions: true };
        }
    },
    'show-if-correct': {
        label: 'Show If Correct',
        icon: 'fa-check-circle',
        category: 'Logic',
        description: 'Show a target when a "correct" event happens in the scene.',
        params: {
            event: { type: 'text', default: 'correct', label: 'Event name' },
            target: { type: 'selector', default: '', label: 'Target selector' },
            action: { type: 'select', options: ['show', 'hide'], default: 'show', label: 'Then' }
        },
        apply(entity, params) {
            entity.setAttribute('studio-condition', {
                event: params.event || 'correct',
                target: params.target || '',
                action: params.action || 'show'
            });
            return { attrs: ['studio-condition'] };
        }
    },
    'count-and-reward': {
        label: 'Count and Reward',
        icon: 'fa-trophy',
        category: 'Logic',
        description: 'Count clicks and trigger an event when the target is reached.',
        params: {
            target: { type: 'number', default: 5, min: 1, max: 100, step: 1, label: 'Clicks needed' },
            message: { type: 'text', default: 'Well done!', label: 'Reward message' },
            rewardEvent: { type: 'text', default: 'counter-complete', label: 'Reward event' }
        },
        apply(entity, params) {
            entity.setAttribute('studio-counter', {
                target: number(params.target, 5),
                message: params.message || 'Well done!',
                rewardEvent: params.rewardEvent || 'counter-complete'
            });
            return { attrs: ['studio-counter'] };
        }
    }
};

function paramsAxis(value) {
    return value === 'x' ? 'x' : 'z';
}

// Merge the Dreamweaver-inspired behaviour set into the main library.
Object.assign(BEHAVIOR_LIBRARY, DREAMWEAVER_BEHAVIORS);

export const BEHAVIOR_PRESETS = {
    'door': {
        label: 'Door Preset',
        description: 'Open/close on click with a sound effect.',
        behaviors: [
            { type: 'open-close', params: { angle: 90, duration: 0.9, axis: 'y' } },
            { type: 'play-sound-on-click', params: { src: '', volume: 0.8 } }
        ]
    },
    'spinner': {
        label: 'Spinner Preset',
        description: 'A continuously rotating object.',
        behaviors: [
            { type: 'rotate-loop', params: { axis: 'y', speed: 45 } }
        ]
    },
    'quiz-button': {
        label: 'Quiz Button Preset',
        description: 'Highlight, click sound and a click counter.',
        behaviors: [
            { type: 'highlight', params: { normalColor: '#4CC3D9', highlightColor: '#ffd166' } },
            { type: 'play-sound-on-click', params: { src: '', volume: 0.8 } },
            { type: 'count-and-reward', params: { target: 3, message: 'Correct!', rewardEvent: 'correct' } }
        ]
    }
};

export class AFrameBehaviorSystem {
    constructor(app) {
        this.app = app;
    }

    getLibrary() {
        return BEHAVIOR_LIBRARY;
    }

    getPresets() {
        return BEHAVIOR_PRESETS;
    }

    getApplied(entity) {
        if (!entity) return [];
        try {
            const parsed = JSON.parse(entity.dataset.studioBehaviors || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch (err) {
            return [];
        }
    }

    saveApplied(entity, behaviors) {
        entity.dataset.studioBehaviors = JSON.stringify(behaviors);
    }

    add(entity, type, params = {}) {
        const definition = BEHAVIOR_LIBRARY[type];
        if (!entity || !definition) return null;

        const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const result = definition.apply(entity, params, id, this.app) || {};
        const record = {
            id,
            type,
            params: { ...params },
            attrs: result.attrs || [],
            external: result.external || [],
            actions: !!result.actions
        };

        const applied = this.getApplied(entity);
        applied.push(record);
        this.saveApplied(entity, applied);
        return record;
    }

    remove(entity, id) {
        if (!entity) return;
        const applied = this.getApplied(entity);
        const record = applied.find(item => item.id === id);
        if (!record) return;

        (record.attrs || []).forEach(attr => {
            if (attr && entity.hasAttribute(attr)) entity.removeAttribute(attr);
        });

        (record.external || []).forEach(item => {
            const target = item.selector ? document.querySelector(item.selector) : entity;
            if (target && item.attr && target.hasAttribute(item.attr)) target.removeAttribute(item.attr);
        });

        if (record.actions) removeAction(entity, id);

        this.saveApplied(entity, applied.filter(item => item.id !== id));
    }

    applyPreset(entity, presetName) {
        const preset = BEHAVIOR_PRESETS[presetName];
        if (!entity || !preset) return [];
        return preset.behaviors.map(behavior => this.add(entity, behavior.type, behavior.params));
    }

    getDefinition(type) {
        return BEHAVIOR_LIBRARY[type] || null;
    }

    getData() {
        return getComponentData;
    }
}
