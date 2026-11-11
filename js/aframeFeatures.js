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
                    self.runAction(action, evt);
                } catch (err) {
                    console.error('Behaviour error:', action, err);
                }
            });
        },

        runAction: function (action, evt) {
            var el = this.el;
            var target = resolveTarget(el, action.target || '');
            var value = action.value || '';
            var type = action.type || action.action;

            switch (type) {
                case 'goto-url':
                    if (value) {
                        if (action.newTab) window.open(value, '_blank');
                        else window.location.href = value;
                    }
                    break;
                case 'open-window':
                    if (value) {
                        var features = 'noopener';
                        if (action.width) features += ',width=' + action.width;
                        if (action.height) features += ',height=' + action.height;
                        window.open(value, action.windowName || '_blank', features);
                    }
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
                    if (target && value) {
                        target.setAttribute('src', value);
                        target.setAttribute('material', 'src', value);
                    }
                    break;
                case 'set-color':
                    if (target && value) target.setAttribute('material', 'color', value);
                    break;
                case 'set-visible':
                    if (target) target.setAttribute('visible', value === true || value === 'true');
                    break;
                case 'restore-image':
                    if (target) {
                        var original = target.getAttribute('data-studio-original-src');
                        if (original) {
                            target.setAttribute('src', original);
                            target.setAttribute('material', 'src', original);
                        }
                    }
                    break;
                case 'set-attribute':
                    if (target && action.attribute) {
                        var parts = String(action.attribute).split('.');
                        if (parts.length > 1) target.setAttribute(parts[0], parts[1], value);
                        else target.setAttribute(action.attribute, value);
                    }
                    break;
                case 'control-animation': {
                    var animTarget = target || el;
                    if (!animTarget || !action.animation) break;
                    if (action.command === 'Remove') {
                        animTarget.removeAttribute(action.animation);
                    } else {
                        var anim = animTarget.components && animTarget.components[action.animation];
                        if (anim && action.command === 'Pause' && anim.pause) anim.pause();
                        if (anim && action.command === 'Resume' && anim.play) anim.play();
                    }
                    break;
                }
                case 'emit-event':
                    if (target && action.eventName) {
                        var detail = {};
                        try { detail = JSON.parse(action.detail || '{}'); } catch (err) { detail = {}; }
                        target.emit(action.eventName, detail);
                    }
                    break;
                case 'snap-dropped-entity': {
                    var dropped = evt && evt.detail && evt.detail.other;
                    if (!dropped || !dropped.object3D) break;
                    var snapTarget = target || el;
                    var a = snapTarget.object3D.position;
                    var b = dropped.object3D.position;
                    b.x = a.x;
                    b.z = a.z;
                    if (action.axis === 'X Y Z') b.y = a.y;
                    break;
                }
                case 'teleport-camera': {
                    var cameraRig = el.sceneEl && (el.sceneEl.querySelector('#camera-rig') || el.sceneEl.querySelector('a-camera'));
                    if (cameraRig) {
                        var worldPos = new THREE.Vector3();
                        el.object3D.getWorldPosition(worldPos);
                        cameraRig.setAttribute('position', worldPos.x + ' ' + (worldPos.y + 1.6) + ' ' + worldPos.z);
                    }
                    break;
                }
                case 'run-code':
                    try {
                        new Function('el', 'event', value).call(el, el, evt);
                    } catch (err) {
                        console.error('Custom JavaScript behaviour error:', err);
                    }
                    break;
                case 'vibrate': {
                    var duration = Number(action.duration || 120);
                    var intensity = Number(action.intensity ?? 0.6);
                    if (navigator.vibrate) navigator.vibrate(duration);
                    var controllers = el.sceneEl ? el.sceneEl.querySelectorAll('[tracked-controls], [laser-controls], [hand-controls]') : [];
                    controllers.forEach(function (controller) {
                        var actuators = controller.components && controller.components['tracked-controls'] && controller.components['tracked-controls'].controller && controller.components['tracked-controls'].controller.hapticActuators;
                        if (actuators && actuators[0] && actuators[0].pulse) actuators[0].pulse(intensity, duration);
                    });
                    break;
                }
                case 'create-entity': {
                    var sceneEl = el.sceneEl;
                    if (!sceneEl) break;
                    var shape = document.createElement(action.shape || 'a-sphere');
                    shape.setAttribute('color', action.color || '#a78bfa');
                    var pos = action.position || 'random';
                    if (pos === 'random') {
                        pos = [(Math.random() * 4 - 2).toFixed(1), (1 + Math.random() * 2).toFixed(1), (-2 - Math.random() * 3).toFixed(1)].join(' ');
                    }
                    shape.setAttribute('position', pos);
                    shape.setAttribute('scale', '0.5 0.5 0.5');
                    if (action.clickable) shape.classList.add('clickable');
                    shape.dataset.studioCreated = 'true';
                    sceneEl.appendChild(shape);
                    break;
                }
                case 'remove-created-entities': {
                    var created = el.sceneEl ? el.sceneEl.querySelectorAll('[data-studio-created]') : [];
                    created.forEach(function (entity) { entity.remove(); });
                    break;
                }
                case 'check-feature': {
                    var feature = action.feature || 'WebGL2';
                    var test = Promise.resolve(false);
                    if (feature.indexOf('WebXR') === 0 && navigator.xr) {
                        test = navigator.xr.isSessionSupported(feature.indexOf('AR') > -1 ? 'immersive-ar' : 'immersive-vr');
                    } else if (feature === 'WebGL2') {
                        test = Promise.resolve(!!document.createElement('canvas').getContext('webgl2'));
                    } else if (feature === 'Web Audio') {
                        test = Promise.resolve(!!(window.AudioContext || window.webkitAudioContext));
                    } else if (feature === 'Service Worker') {
                        test = Promise.resolve('serviceWorker' in navigator);
                    } else if (feature === 'Geolocation') {
                        test = Promise.resolve('geolocation' in navigator);
                    } else if (feature === 'Vibration') {
                        test = Promise.resolve('vibrate' in navigator);
                    } else if (feature === 'Clipboard') {
                        test = Promise.resolve(!!navigator.clipboard);
                    } else if (feature === 'Fullscreen') {
                        test = Promise.resolve(!!document.fullscreenEnabled);
                    } else if (feature === 'Touch input') {
                        test = Promise.resolve(navigator.maxTouchPoints > 0);
                    }
                    test.catch(function () { return false; }).then(function (supported) {
                        var url = supported ? action.yesUrl : action.noUrl;
                        if (url) window.open(url, '_blank');
                    });
                    break;
                }
                case 'toggle-fullscreen': {
                    var fullscreenTarget = (el.sceneEl && el.sceneEl.canvas) || document.documentElement;
                    if (document.fullscreenElement) document.exitFullscreen();
                    else if (fullscreenTarget.requestFullscreen) fullscreenTarget.requestFullscreen();
                    break;
                }
                case 'copy-clipboard':
                    if (navigator.clipboard && value) navigator.clipboard.writeText(value);
                    break;
                case 'speak-text':
                    if (window.speechSynthesis && value) {
                        speechSynthesis.speak(new SpeechSynthesisUtterance(value));
                    }
                    break;
                case 'share':
                    if (navigator.share) {
                        navigator.share({ title: action.title || '', text: action.text || '', url: value || '' }).catch(function () {});
                    }
                    break;
                case 'animate-element': {
                    var domTarget = target || el;
                    if (domTarget && domTarget.animate) {
                        domTarget.animate({ [action.property || 'transform']: value }, {
                            duration: Number(action.duration) || 1200,
                            easing: action.easing || 'ease-in-out',
                            iterations: Number(action.iterations) || 1,
                            direction: action.direction || 'alternate',
                            fill: 'forwards'
                        });
                    }
                    break;
                }
                case 'stop-animations':
                    if (target && target.getAnimations) target.getAnimations().forEach(function (anim) { anim.cancel(); });
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
    AFRAME.registerComponent('studio-drag', {
        schema: {
            enabled: { type: 'boolean', default: true }
        },

        init: function () {
            this.dragging = false;
            this.lastX = 0;
            this.lastY = 0;
            this.onDown = this.onDown.bind(this);
            this.onMove = this.onMove.bind(this);
            this.onUp = this.onUp.bind(this);
            this.el.addEventListener('pointerdown', this.onDown);
            this.el.addEventListener('mousedown', this.onDown);
            var canvas = this.el.sceneEl && this.el.sceneEl.canvas;
            if (canvas) {
                canvas.addEventListener('pointermove', this.onMove);
                canvas.addEventListener('pointerup', this.onUp);
                canvas.addEventListener('pointerleave', this.onUp);
            }
        },

        remove: function () {
            this.el.removeEventListener('pointerdown', this.onDown);
            this.el.removeEventListener('mousedown', this.onDown);
            var canvas = this.el.sceneEl && this.el.sceneEl.canvas;
            if (canvas) {
                canvas.removeEventListener('pointermove', this.onMove);
                canvas.removeEventListener('pointerup', this.onUp);
                canvas.removeEventListener('pointerleave', this.onUp);
            }
        },

        onDown: function (evt) {
            if (!this.data.enabled) return;
            this.dragging = true;
            this.lastX = evt.clientX;
            this.lastY = evt.clientY;
            if (this.el.sceneEl && this.el.sceneEl.canvas) this.el.sceneEl.canvas.style.cursor = 'grabbing';
        },

        onMove: function (evt) {
            if (!this.dragging || !this.data.enabled) return;
            var dx = evt.clientX - this.lastX;
            var dy = evt.clientY - this.lastY;
            this.lastX = evt.clientX;
            this.lastY = evt.clientY;

            var camera = this.el.sceneEl && this.el.sceneEl.camera;
            if (!camera) return;
            var right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
            var up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
            var distance = camera.position.distanceTo(this.el.object3D.position);
            var scale = Math.max(0.002, distance * 0.0015);
            this.el.object3D.position.addScaledVector(right, dx * scale);
            this.el.object3D.position.addScaledVector(up, -dy * scale);
        },

        onUp: function () {
            this.dragging = false;
            if (this.el.sceneEl && this.el.sceneEl.canvas) this.el.sceneEl.canvas.style.cursor = '';
        }
    });

    AFRAME.registerComponent('studio-open-close', {
        schema: {
            angle: { type: 'number', default: 90 },
            duration: { type: 'number', default: 900 },
            axis: { type: 'string', default: 'y' }
        },

        init: function () {
            this.open = false;
            this.rotation = this.el.getAttribute('rotation') || { x: 0, y: 0, z: 0 };
            this.bound = this.toggle.bind(this);
            this.el.addEventListener('click', this.bound);
        },

        remove: function () {
            this.el.removeEventListener('click', this.bound);
        },

        toggle: function () {
            this.open = !this.open;
            var axis = this.data.axis || 'y';
            var base = Number(this.rotation[axis] || 0);
            var target = base + (this.open ? Number(this.data.angle) : 0);
            var to = { x: Number(this.rotation.x || 0), y: Number(this.rotation.y || 0), z: Number(this.rotation.z || 0) };
            to[axis] = target;
            this.el.setAttribute('animation__studio_open', {
                property: 'rotation',
                to: to.x + ' ' + to.y + ' ' + to.z,
                dur: Number(this.data.duration) || 900,
                easing: 'easeInOutQuad'
            });
        }
    });

    AFRAME.registerComponent('studio-counter', {
        schema: {
            target: { type: 'int', default: 5 },
            rewardEvent: { type: 'string', default: 'counter-complete' },
            message: { type: 'string', default: 'Well done!' }
        },

        init: function () {
            this.count = 0;
            this.bound = this.increment.bind(this);
            this.el.addEventListener('click', this.bound);
        },

        remove: function () {
            this.el.removeEventListener('click', this.bound);
        },

        increment: function () {
            this.count++;
            this.el.emit('counter-changed', { count: this.count, target: this.data.target });
            if (this.count >= Number(this.data.target)) {
                this.el.emit(this.data.rewardEvent || 'counter-complete', { count: this.count });
                if (this.data.message) {
                    var textEl = this.el.sceneEl && this.el.sceneEl.querySelector('#reward-text');
                    if (textEl) textEl.setAttribute('text', 'value', this.data.message);
                }
            }
        }
    });

    AFRAME.registerComponent('studio-condition', {
        schema: {
            event: { type: 'string', default: 'correct' },
            target: { type: 'selector', default: null },
            action: { type: 'string', default: 'show' }
        },

        init: function () {
            this.bound = this.run.bind(this);
            this.el.addEventListener(this.data.event, this.bound);
        },

        update: function (oldData) {
            if (oldData.event && oldData.event !== this.data.event) {
                this.el.removeEventListener(oldData.event, this.bound);
                this.el.addEventListener(this.data.event, this.bound);
            }
        },

        remove: function () {
            this.el.removeEventListener(this.data.event, this.bound);
        },

        run: function () {
            var target = this.data.target;
            if (!target) return;
            if (this.data.action === 'hide') target.setAttribute('visible', false);
            else target.setAttribute('visible', true);
        }
    });

    // XR body triggers/colliders and grabbing, adapted from the XR kit.
    var XR_BODIES = new Set();
    AFRAME.registerComponent('xr-body', {
        schema: {
            mode: { default: 'trigger', oneOf: ['trigger', 'collider'] },
            role: { default: 'object', oneOf: ['object', 'player'] },
            filter: { default: 'any', oneOf: ['any', 'player', 'object'] },
            size: { type: 'vec3' }
        },
        init: function () {
            this.box = new THREE.Box3();
            this.center = new THREE.Vector3();
            this.sizeVec = new THREE.Vector3();
            this.inside = new Set();
            XR_BODIES.add(this);
            if (this.el.hasAttribute('hand-tracking-controls')) {
                this.el.addEventListener('pinchstarted', (e) => { this.el._xrPinchPoint = e.detail.position.clone(); });
                this.el.addEventListener('pinchmoved', (e) => { this.el._xrPinchPoint = e.detail.position.clone(); });
                this.el.addEventListener('pinchended', () => { delete this.el._xrPinchPoint; });
            }
        },
        remove: function () { XR_BODIES.delete(this); },
        tick: function () {
            var el = this.el, d = this.data, z = d.size;
            var hand = el.hasAttribute('hand-tracking-controls');
            el.object3D.updateMatrixWorld(true);
            if (hand && !el._xrPinchPoint) this.box.makeEmpty();
            else if ((z && (z.x > 0 || z.y > 0 || z.z > 0)) || hand) {
                this.box.setFromCenterAndSize(el._xrPinchPoint || el.object3D.getWorldPosition(this.center), this.sizeVec.set(z.x || 0.12, z.y || 0.12, z.z || 0.12));
            } else {
                this.box.setFromObject(el.object3D);
            }
            var now = new Set();
            XR_BODIES.forEach((other) => {
                if (other === this || (d.filter !== 'any' && other.data.role !== d.filter) || el.contains(other.el) || other.el.contains(el)) return;
                if (this.box.intersectsBox(other.box)) now.add(other.el);
            });
            now.forEach((other) => { if (!this.inside.has(other)) this.ping('enter', other); });
            this.inside.forEach((other) => { if (!now.has(other)) this.ping('exit', other); });
            this.inside = now;
        },
        ping: function (kind, other) {
            var ob = other.components && other.components['xr-body'];
            var trigger = this.data.mode === 'trigger' || (ob && ob.data.mode === 'trigger');
            this.el.emit('xr-' + (trigger ? 'trigger' : 'collision') + '-' + kind, { other: other }, false);
        }
    });

    AFRAME.xrDrop = function (el) {
        var grab = el.components['xr-grab'];
        var box = new THREE.Box3().setFromObject(el.object3D);
        if (grab && grab.data.drop === 'floor' && !box.isEmpty()) el.object3D.position.y -= box.min.y;
        el.emit('dropped', {}, false);
        XR_BODIES.forEach((zone) => {
            if (zone.data.mode === 'trigger' && zone.inside.has(el)) zone.el.emit('xr-drop-in', { other: el }, false);
        });
    };

    AFRAME.registerComponent('xr-grab', {
        schema: {
            button: { default: 'grip', oneOf: ['grip', 'trigger', 'either'] },
            reach: { default: 0.25 },
            drop: { default: 'stay', oneOf: ['stay', 'floor'] }
        },
        init: function () {
            this.by = null;
            this.offset = new THREE.Vector3();
            this.hands = [];
            if (!this.el.components['xr-body']) this.el.setAttribute('xr-body', 'mode: collider');
            var scene = this.el.sceneEl;
            var bindHands = () => scene.querySelectorAll('[laser-controls],[hand-controls],[oculus-touch-controls],[hand-tracking-controls]').forEach((hand) => this.bind(hand));
            if (scene.hasLoaded) bindHands();
            else scene.addEventListener('loaded', bindHands);
        },
        bind: function (hand) {
            if (this.hands.includes(hand)) return;
            this.hands.push(hand);
            var wanted = (button) => this.data.button === 'either' || this.data.button === button;
            if (hand.hasAttribute('hand-tracking-controls')) {
                hand.addEventListener('pinchstarted', (e) => this.take(hand, e.detail.position));
                hand.addEventListener('pinchmoved', (e) => { if (this.by === hand) this.follow(e.detail.position); });
                hand.addEventListener('pinchended', () => this.release(hand));
            } else {
                ['grip', 'trigger'].forEach((button) => {
                    hand.addEventListener(button + 'down', () => wanted(button) && this.take(hand));
                    hand.addEventListener(button + 'up', () => wanted(button) && this.release(hand));
                });
            }
        },
        take: function (hand, point) {
            if (this.by) return;
            var obj = this.el.object3D;
            var p = point ? point.clone() : hand.object3D.getWorldPosition(new THREE.Vector3());
            var raycaster = hand.components.raycaster;
            var hit = (raycaster && raycaster.intersectedEls.includes(this.el)) || new THREE.Box3().setFromObject(obj).distanceToPoint(p) <= this.data.reach;
            if (!hit) return;
            this.by = hand;
            if (point) this.offset.copy(obj.getWorldPosition(new THREE.Vector3())).sub(p);
            else hand.object3D.attach(obj);
            this.el.emit('grabbed', { hand: hand }, false);
        },
        follow: function (point) {
            var obj = this.el.object3D;
            var v = point.clone().add(this.offset);
            obj.parent.worldToLocal(v);
            obj.position.copy(v);
        },
        release: function (hand) {
            if (this.by !== hand) return;
            this.by = null;
            if (!hand.hasAttribute('hand-tracking-controls')) this.el.sceneEl.object3D.attach(this.el.object3D);
            AFRAME.xrDrop(this.el);
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
