/** Dreamweaver-inspired behaviours for the A-Frame builder. */
const number = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

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

function addAction(entity, id, action) {
    const actions = getActions(entity);
    actions.push({ ...action, _behaviorId: id });
    entity.setAttribute('studio-behavior', 'actions', JSON.stringify(actions));
}

export const DREAMWEAVER_BEHAVIORS = {
    'go-to-url': {
        label: 'Go To URL', icon: 'fa-external-link-alt', category: 'Page & Navigation',
        description: 'Navigate to another page or open a link in a new tab.',
        params: {
            url: { type: 'text', default: 'https://aframe.io', label: 'URL' },
            target: { type: 'select', options: ['_self', '_blank'], default: '_blank', label: 'Open in' }
        },
        apply(entity, params, id) {
            addAction(entity, id, { trigger: 'click', type: 'goto-url', value: params.url || '', newTab: params.target === '_blank' });
            return { actions: true };
        }
    },
    'open-popup-window': {
        label: 'Open Popup Window', icon: 'fa-window-restore', category: 'Page & Navigation',
        description: 'Open a URL in a sized popup window.',
        params: {
            url: { type: 'text', default: 'https://aframe.io', label: 'URL' },
            windowName: { type: 'text', default: 'dwWin', label: 'Window name' },
            width: { type: 'number', default: 480, label: 'Width' },
            height: { type: 'number', default: 360, label: 'Height' }
        },
        apply(entity, params, id) {
            addAction(entity, id, {
                trigger: 'click', type: 'open-window', value: params.url || '',
                windowName: params.windowName || 'dwWin', width: number(params.width, 480), height: number(params.height, 360)
            });
            return { actions: true };
        }
    },
    'popup-message': {
        label: 'Popup Message', icon: 'fa-comment', category: 'Page & Navigation',
        description: 'Show a simple message dialog when the object is clicked.',
        params: { message: { type: 'textarea', default: 'Hello World!', label: 'Message' } },
        apply(entity, params, id) {
            addAction(entity, id, { trigger: 'click', type: 'popup-message', value: params.message || '' });
            return { actions: true };
        }
    },
    'preload-images': {
        label: 'Preload Images', icon: 'fa-download', category: 'Page & Navigation',
        description: 'Download images into the asset library so they appear instantly later.',
        params: { urls: { type: 'textarea', default: '', label: 'Image URLs (one per line)' } },
        apply(entity, params, id, app) {
            String(params.urls || '').split(/[\n,]+/).map(url => url.trim()).filter(Boolean).forEach(url => {
                if (!url.startsWith('#') && app?.assetSystem) {
                    const exists = app.assetSystem.getAssets().some(asset => asset.src === url);
                    if (!exists) app.assetSystem.addAsset({ name: 'Preloaded image', type: 'image', src: url });
                }
            });
            return { actions: false };
        }
    },
    'set-text': {
        label: 'Set Text', icon: 'fa-font', category: 'Page & Navigation',
        description: 'Replace the text on a text entity.',
        params: {
            target: { type: 'entity', default: '', label: 'Text entity' },
            text: { type: 'textarea', default: 'New text', label: 'New text' },
            trigger: { type: 'select', options: ['click', 'mouseenter'], default: 'click', label: 'When' }
        },
        apply(entity, params, id) {
            addAction(entity, id, { trigger: params.trigger || 'click', type: 'set-text', target: params.target || '', value: params.text || '' });
            return { actions: true };
        }
    },
    'show-hide-elements': {
        label: 'Show-Hide Elements', icon: 'fa-eye-slash', category: 'Page & Navigation',
        description: 'Show, hide or toggle another element in the scene.',
        params: {
            target: { type: 'entity', default: '', label: 'Target element' },
            mode: { type: 'select', options: ['show', 'hide', 'toggle'], default: 'toggle', label: 'Action' },
            trigger: { type: 'select', options: ['click', 'mouseenter'], default: 'click', label: 'When' }
        },
        apply(entity, params, id) {
            const actionType = params.mode === 'show' ? 'show-element' : params.mode === 'hide' ? 'hide-element' : 'toggle-visibility';
            addAction(entity, id, { trigger: params.trigger || 'click', type: actionType, target: params.target || '' });
            return { actions: true };
        }
    },
    'swap-image-restore': {
        label: 'Swap Image Restore', icon: 'fa-undo', category: 'Visual State',
        description: 'Restore the original image after a Swap Image behaviour.',
        params: {
            target: { type: 'image-target', default: '', label: 'Image to restore' },
            trigger: { type: 'select', options: ['mouseleave', 'click'], default: 'mouseleave', label: 'When' }
        },
        apply(entity, params, id) {
            const target = params.target || '';
            const targetElement = target ? document.querySelector(target) : entity;
            if (targetElement) targetElement.setAttribute('data-studio-original-src', targetElement.getAttribute('src') || '');
            addAction(entity, id, { trigger: params.trigger || 'mouseleave', type: 'restore-image', target });
            return { actions: true };
        }
    }
    ,
    'set-entity-attribute': {
        label: 'Set Entity Attribute', icon: 'fa-sliders-h', category: 'A-Frame',
        description: 'Set an attribute or component property on an entity.',
        params: {
            target: { type: 'entity', default: '', label: 'Entity' },
            attribute: { type: 'select', options: ['position', 'rotation', 'scale', 'visible', 'material.color', 'material.opacity', 'material.metalness', 'material.roughness', 'material.wireframe'], default: 'material.color', label: 'Attribute' },
            value: { type: 'text', default: '#ff8800', label: 'Value' },
            trigger: { type: 'select', options: ['click', 'mouseenter', 'mouseleave'], default: 'click', label: 'When' }
        },
        apply(entity, params, id) {
            addAction(entity, id, { trigger: params.trigger || 'click', type: 'set-attribute', target: params.target || '', attribute: params.attribute, value: params.value });
            return { actions: true };
        }
    },
    'animate-entity': {
        label: 'Animate Entity', icon: 'fa-film', category: 'A-Frame',
        description: 'Animate an entity position, rotation, scale or colour.',
        params: {
            target: { type: 'entity', default: '', label: 'Entity' },
            property: { type: 'select', options: ['position', 'rotation', 'scale', 'material.color', 'material.opacity'], default: 'rotation', label: 'Property' },
            to: { type: 'text', default: '0 360 0', label: 'To' },
            duration: { type: 'number', default: 1500, label: 'Duration (ms)' },
            easing: { type: 'select', options: ['linear', 'easeInOutQuad', 'easeOutElastic', 'easeOutBounce', 'easeInOutSine'], default: 'easeInOutQuad', label: 'Easing' },
            loop: { type: 'boolean', default: false, label: 'Loop' },
            direction: { type: 'select', options: ['normal', 'alternate'], default: 'normal', label: 'Direction' },
            trigger: { type: 'select', options: ['click', 'auto'], default: 'click', label: 'When' }
        },
        apply(entity, params, id) {
            const attr = 'animation__studio_' + id;
            const targetSelector = params.target || '';
            const targetElement = targetSelector ? document.querySelector(targetSelector) : entity;
            if (!targetElement) return { actions: false };
            const animation = {
                property: params.property || 'rotation', to: params.to || '0 360 0',
                dur: number(params.duration, 1500), easing: params.easing || 'easeInOutQuad',
                loop: params.loop === true, dir: params.direction || 'normal'
            };
            if (animation.property === 'material.color') {
                animation.property = 'components.material.material.color';
                animation.type = 'color';
            }
            if ((params.trigger || 'click') === 'click') {
                animation.startEvents = 'start-anim';
                addAction(entity, id, { trigger: 'click', type: 'start-animation', target: targetSelector });
            }
            targetElement.setAttribute(attr, animation);
            return { actions: (params.trigger || 'click') === 'click', external: [{ selector: targetSelector, attr }] };
        }
    },
    'control-animation': {
        label: 'Control Animation', icon: 'fa-pause-circle', category: 'A-Frame',
        description: 'Pause, resume or remove an animation.',
        params: {
            target: { type: 'entity', default: '', label: 'Entity' },
            animation: { type: 'text', default: 'animation__dw', label: 'Animation attribute' },
            command: { type: 'select', options: ['Pause', 'Resume', 'Remove'], default: 'Pause', label: 'Action' },
            trigger: { type: 'select', options: ['click', 'mouseenter'], default: 'click', label: 'When' }
        },
        apply(entity, params, id) {
            addAction(entity, id, { trigger: params.trigger || 'click', type: 'control-animation', target: params.target || '', animation: params.animation || 'animation__dw', command: params.command || 'Pause' });
            return { actions: true };
        }
    },
    'emit-event': {
        label: 'Emit Event', icon: 'fa-bolt', category: 'A-Frame',
        description: 'Emit a custom A-Frame event that other behaviours can listen for.',
        params: {
            target: { type: 'entity', default: '', label: 'Entity' },
            eventName: { type: 'text', default: 'my-event', label: 'Event name' },
            detail: { type: 'text', default: '{}', label: 'Detail (JSON)' },
            trigger: { type: 'select', options: ['click', 'mouseenter'], default: 'click', label: 'When' }
        },
        apply(entity, params, id) {
            addAction(entity, id, { trigger: params.trigger || 'click', type: 'emit-event', target: params.target || '', eventName: params.eventName || 'my-event', detail: params.detail || '{}' });
            return { actions: true };
        }
    },
    'enter-exit-xr': {
        label: 'Enter / Exit XR', icon: 'fa-vr-cardboard', category: 'A-Frame',
        description: 'Enter VR, enter AR or exit immersive mode.',
        params: { mode: { type: 'select', options: ['Enter VR', 'Exit VR', 'Enter AR'], default: 'Enter VR', label: 'Action' } },
        apply(entity, params, id) {
            const type = params.mode === 'Exit VR' ? 'exit-vr' : params.mode === 'Enter AR' ? 'enter-ar' : 'enter-vr';
            addAction(entity, id, { trigger: 'click', type });
            return { actions: true };
        }
    },
    'create-entity': {
        label: 'Create Entity', icon: 'fa-cube', category: 'A-Frame',
        description: 'Create a new 3D shape when the object is clicked.',
        params: {
            shape: { type: 'select', options: ['a-box', 'a-sphere', 'a-cylinder', 'a-cone', 'a-torus', 'a-octahedron', 'a-tetrahedron'], default: 'a-sphere', label: 'Shape' },
            color: { type: 'color', default: '#a78bfa', label: 'Colour' },
            position: { type: 'text', default: 'random', label: 'Position (or random)' },
            clickable: { type: 'boolean', default: true, label: 'Clickable' }
        },
        apply(entity, params, id) {
            addAction(entity, id, { trigger: 'click', type: 'create-entity', shape: params.shape || 'a-sphere', color: params.color || '#a78bfa', position: params.position || 'random', clickable: params.clickable !== false });
            return { actions: true };
        }
    },
    'remove-created-entities': {
        label: 'Remove Created Entities', icon: 'fa-trash-alt', category: 'A-Frame',
        description: 'Remove shapes created by Create Entity.',
        params: {},
        apply(entity, params, id) {
            addAction(entity, id, { trigger: 'click', type: 'remove-created-entities' });
            return { actions: true };
        }
    },
    'drag-entity': {
        label: 'Drag Entity (3D)', icon: 'fa-arrows-alt', category: 'A-Frame',
        description: 'Make a 3D object draggable with the pointer.',
        params: {},
        apply(entity) {
            entity.setAttribute('studio-drag', 'enabled: true');
            return { attrs: ['studio-drag'] };
        }
    }
    ,
    'check-feature': {
        label: 'Check Feature', icon: 'fa-check-double', category: 'Modern Web',
        description: 'Check whether the browser supports a feature and optionally navigate.',
        params: {
            feature: { type: 'select', options: ['WebXR (immersive VR)', 'WebXR (immersive AR)', 'WebGL2', 'Web Audio', 'Service Worker', 'Geolocation', 'Vibration', 'Clipboard', 'Fullscreen', 'Touch input'], default: 'WebXR (immersive VR)', label: 'Feature' },
            yesUrl: { type: 'text', default: '', label: 'If supported, go to URL' },
            noUrl: { type: 'text', default: '', label: 'Otherwise, go to URL' }
        },
        apply(entity, params, id) {
            addAction(entity, id, { trigger: 'click', type: 'check-feature', feature: params.feature || 'WebGL2', yesUrl: params.yesUrl || '', noUrl: params.noUrl || '' });
            return { actions: true };
        }
    },
    'toggle-fullscreen': {
        label: 'Toggle Fullscreen', icon: 'fa-expand', category: 'Modern Web',
        description: 'Enter or leave fullscreen mode.', params: {},
        apply(entity, params, id) {
            addAction(entity, id, { trigger: 'click', type: 'toggle-fullscreen' });
            return { actions: true };
        }
    },
    'copy-to-clipboard': {
        label: 'Copy to Clipboard', icon: 'fa-copy', category: 'Modern Web',
        description: 'Copy text to the clipboard.',
        params: { text: { type: 'textarea', default: 'Copied from Pixel AFrame', label: 'Text' } },
        apply(entity, params, id) {
            addAction(entity, id, { trigger: 'click', type: 'copy-clipboard', value: params.text || '' });
            return { actions: true };
        }
    },
    'speak-text': {
        label: 'Speak Text', icon: 'fa-assistive-listening-systems', category: 'Modern Web',
        description: 'Read text aloud using the browser speech synthesiser.',
        params: { text: { type: 'textarea', default: 'Hello from Pixel AFrame', label: 'Text' } },
        apply(entity, params, id) {
            addAction(entity, id, { trigger: 'click', type: 'speak-text', value: params.text || '' });
            return { actions: true };
        }
    },
    'share': {
        label: 'Share', icon: 'fa-share-alt', category: 'Modern Web',
        description: 'Use the device share sheet.',
        params: {
            title: { type: 'text', default: 'Pixel AFrame', label: 'Title' },
            text: { type: 'text', default: 'Try this scene', label: 'Text' },
            url: { type: 'text', default: '', label: 'URL' }
        },
        apply(entity, params, id) {
            addAction(entity, id, { trigger: 'click', type: 'share', title: params.title || '', text: params.text || '', value: params.url || '' });
            return { actions: true };
        }
    },
    'animate-element': {
        label: 'Animate Element', icon: 'fa-magic', category: 'Modern Web',
        description: 'Animate a DOM element such as a panel or overlay.',
        params: {
            target: { type: 'entity', default: '', label: 'Element' },
            property: { type: 'select', options: ['transform', 'opacity', 'backgroundColor', 'width', 'height', 'left', 'top'], default: 'transform', label: 'Property' },
            to: { type: 'text', default: 'translateX(240px) rotate(10deg)', label: 'To' },
            duration: { type: 'number', default: 1200, label: 'Duration (ms)' },
            easing: { type: 'select', options: ['linear', 'ease', 'ease-in-out'], default: 'ease-in-out', label: 'Easing' },
            iterations: { type: 'number', default: 2, label: 'Iterations' },
            direction: { type: 'select', options: ['normal', 'alternate'], default: 'alternate', label: 'Direction' }
        },
        apply(entity, params, id) {
            addAction(entity, id, { trigger: 'click', type: 'animate-element', target: params.target || '', property: params.property || 'transform', value: params.to || '', duration: number(params.duration, 1200), easing: params.easing || 'ease-in-out', iterations: number(params.iterations, 1), direction: params.direction || 'alternate' });
            return { actions: true };
        }
    },
    'stop-animations': {
        label: 'Stop Animations', icon: 'fa-stop', category: 'Modern Web',
        description: 'Cancel animations running on the selected element or a target element.',
        params: { target: { type: 'entity', default: '', label: 'Element' } },
        apply(entity, params, id) {
            addAction(entity, id, { trigger: 'click', type: 'stop-animations', target: params.target || '' });
            return { actions: true };
        }
    }
};
