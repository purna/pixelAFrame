/**
 * Small, student-friendly A-Frame components used by the visual editor.
 *
 * The same source is injected into exported scenes so behaviours and particle
 * effects keep working after a project is downloaded.
 */
export const AFrameFeatureScript = `
(function () {
    if (!window.AFRAME || window.__pixelAFrameFeaturesReady) return;
    window.__pixelAFrameFeaturesReady = true;

    var THREE = window.AFRAME.THREE || window.THREE;

    function resolveTarget(el, selector) {
        if (!selector) return el;
        try {
            return document.querySelector(selector);
        } catch (err) {
            return null;
        }
    }

    function getSoundTarget(el, action) {
        var target = resolveTarget(el, action.target);
        if (!target) return null;
        if (target.components && target.components.sound) return target;
        var child = target.querySelector && target.querySelector('[sound]');
        return child || null;
    }

    AFRAME.registerComponent('studio-behavior', {
        schema: {
            actions: { type: 'string', default: '[]' }
        },

        init: function () {
            this.boundHandler = this.handleEvent.bind(this);
            this.attachedEvents = [];
            this.bindActions();
        },

        update: function (oldData) {
            if (oldData.actions !== this.data.actions) {
                this.unbindActions();
                this.bindActions();
            }
        },

        remove: function () {
            this.unbindActions();
        },

        parseActions: function () {
            try {
                var parsed = JSON.parse(this.data.actions || '[]');
                return Array.isArray(parsed) ? parsed : [];
            } catch (err) {
                console.warn('Invalid studio-behavior actions', err);
                return [];
            }
        },

        bindActions: function () {
            var actions = this.parseActions();
            var events = [];
            actions.forEach(function (action) {
                var eventName = action.trigger || 'click';
                if (events.indexOf(eventName) === -1) events.push(eventName);
            });
            this.attachedEvents = events;
            events.forEach(function (eventName) {
                this.el.addEventListener(eventName, this.boundHandler);
            }, this);
        },

        unbindActions: function () {
            if (!this.boundHandler) return;
            (this.attachedEvents || []).forEach(function (eventName) {
                this.el.removeEventListener(eventName, this.boundHandler);
            }, this);
            this.attachedEvents = [];
        },

        handleEvent: function (evt) {
            var eventName = evt.type;
            var actions = this.parseActions();
            var self = this;
            actions.forEach(function (action) {
                if ((action.trigger || 'click') !== eventName) return;
                try {
                    self.runAction(action);
                } catch (err) {
                    console.error('Behaviour error:', action, err);
                }
            });
        },

        runAction: function (action) {
            var el = this.el;
            var target = resolveTarget(el, action.target || '');
            var value = action.value || '';
            var type = action.type || action.action;

            switch (type) {
                case 'goto-url':
                    if (value) window.location.href = value;
                    break;
                case 'open-window':
                    if (value) window.open(value, action.windowName || '_blank');
                    break;
                case 'go-back':
                    history.back();
                    break;
                case 'go-forward':
                    history.forward();
                    break;
                case 'popup-message':
                    alert(value || 'Hello!');
                    break;
                case 'set-text':
                    if (target) target.setAttribute('text', 'value', value);
                    break;
                case 'play-sound': {
                    var soundEl = getSoundTarget(el, action);
                    if (soundEl && soundEl.components.sound) soundEl.components.sound.playSound();
                    break;
                }
                case 'stop-sound': {
                    var stopEl = getSoundTarget(el, action);
                    if (stopEl && stopEl.components.sound) stopEl.components.sound.stopSound();
                    break;
                }
                case 'toggle-visibility':
                    if (target) target.setAttribute('visible', target.getAttribute('visible') === false);
                    break;
                case 'show-element':
                    if (target) target.setAttribute('visible', true);
                    break;
                case 'hide-element':
                    if (target) target.setAttribute('visible', false);
                    break;
                case 'swap-image':
                    if (target && value) target.setAttribute('material', 'src', value);
                    break;
                case 'start-animation':
                    (target || el).emit('start-anim');
                    break;
                case 'stop-animation':
                    (target || el).emit('stop-anim');
                    break;
                case 'enter-vr':
                    if (el.sceneEl && el.sceneEl.enterVR) el.sceneEl.enterVR();
                    break;
                case 'enter-ar':
                    if (el.sceneEl && el.sceneEl.enterAR) el.sceneEl.enterAR();
                    break;
                case 'exit-vr':
                    if (el.sceneEl && el.sceneEl.exitVR) el.sceneEl.exitVR();
                    break;
                default:
                    console.warn('Unknown behaviour action:', type);
            }
        }
    });

    AFRAME.registerComponent('studio-particles', {
        schema: {
            count: { type: 'int', default: 180 },
            color: { type: 'color', default: '#7dd3fc' },
            size: { type: 'number', default: 0.09 },
            speed: { type: 'number', default: 0.7 },
            spread: { type: 'number', default: 4 },
            height: { type: 'number', default: 5 },
            opacity: { type: 'number', default: 0.85 }
        },

        init: function () {
            this.positions = null;
            this.speeds = null;
            this.build();
        },

        update: function (oldData) {
            if (oldData.count !== this.data.count ||
                oldData.color !== this.data.color ||
                oldData.size !== this.data.size ||
                oldData.spread !== this.data.spread ||
                oldData.opacity !== this.data.opacity) {
                this.build();
            }
        },

        build: function () {
            if (!THREE) return;

            if (this.points) {
                this.el.removeObject3D('studio-particles');
                this.points.geometry.dispose();
                this.points.material.dispose();
            }

            var count = Math.max(1, this.data.count);
            var spread = this.data.spread;
            var height = this.data.height;
            var positions = new Float32Array(count * 3);
            var speeds = new Float32Array(count);

            for (var i = 0; i < count; i++) {
                positions[i * 3] = (Math.random() - 0.5) * spread;
                positions[i * 3 + 1] = Math.random() * height;
                positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
                speeds[i] = 0.35 + Math.random() * this.data.speed;
            }

            var geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            var material = new THREE.PointsMaterial({
                color: new THREE.Color(this.data.color),
                size: this.data.size,
                transparent: true,
                opacity: this.data.opacity,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });

            this.positions = positions;
            this.speeds = speeds;
            this.points = new THREE.Points(geometry, material);
            this.el.setObject3D('studio-particles', this.points);
        },

        tick: function (time, timeDelta) {
            if (!this.points || !this.positions) return;

            var delta = Math.min(timeDelta, 100) / 1000;
            var height = this.data.height;
            var positions = this.positions;

            for (var i = 0; i < this.speeds.length; i++) {
                positions[i * 3 + 1] -= this.speeds[i] * delta;
                if (positions[i * 3 + 1] < 0) {
                    positions[i * 3 + 1] = height;
                }
            }

            this.points.geometry.attributes.position.needsUpdate = true;
        }
    });
})();
`;

export function registerAFrameFeatures() {
    if (typeof window === 'undefined' || !window.AFRAME) return;
    if (window.__pixelAFrameFeaturesReady) return;
    // eslint-disable-next-line no-new-func
    new Function(AFrameFeatureScript)();
}
