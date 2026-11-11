/**
 * A-Frame Object Factory
 * Creates A-Frame elements with predefined properties
 */

export class AFrameFactory {
    constructor(app) {
        this.app = app;
        
        // Element type mappings
        this.elementTypes = {
            // Primitives
            'box': 'a-box',
            'sphere': 'a-sphere',
            'cylinder': 'a-cylinder',
            'cone': 'a-cone',
            'plane': 'a-plane',
            'torus': 'a-torus',
            'torus-knot': 'a-torus-knot',
            'circle': 'a-circle',
            'ring': 'a-ring',
            'triangle': 'a-triangle',
            
            // Media
            'image': 'a-image',
            'video': 'a-video',
            'sky': 'a-sky',
            'videosphere': 'a-videosphere',
            'sound': 'a-sound',
            
            // Text & UI
            'text': 'a-text',
            'link': 'a-link',
            'cursor': 'a-cursor',
            
            // Models
            'gltf-model': 'a-gltf-model',
            'obj-model': 'a-obj-model',
            
            // Core Elements
            'entity': 'a-entity',
            'assets': 'a-assets',
            'mixin': 'a-mixin',
            'asset-item': 'a-asset-item',
            
            // Environment
            'light': 'a-light',
            'camera': 'a-camera',
            'environment': 'a-entity',
            
            // Controls & Camera
            'look-controls': 'a-entity',
            'wasd-controls': 'a-entity',
            'orbit-controls': 'a-entity',
            
            // VR
            'hand-controls': 'a-entity',
            'hand-tracking-controls': 'a-entity',
            'laser-controls': 'a-entity',
            
            // Interaction
            'raycaster': 'a-entity',
            'super-hands': 'a-entity',
            
            // Animation
            'animation': 'a-entity',
            'animation-mixer': 'a-entity',
            
            // Preloaded assets (models)
            'xbot': 'a-gltf-model',
            'ybot': 'a-gltf-model',
            'tree1': 'a-gltf-model',
            'tree2': 'a-gltf-model',
            'table': 'a-gltf-model',
            'engine': 'a-gltf-model',
            
            // Preloaded assets (sounds)
            'blip1': 'a-entity',
            'blip2': 'a-entity'
        };
        
        // Default colors for each element type
        this.defaultColors = {
            'a-box': '#4CC3D9',
            'a-sphere': '#EF2D5E',
            'a-cylinder': '#FFC65D',
            'a-cone': '#7BC8A4',
            'a-plane': '#333333',
            'a-torus': '#4CC3D9',
            'a-torus-knot': '#EF2D5E',
            'a-circle': '#FFC65D',
            'a-ring': '#7BC8A4',
            'a-triangle': '#4CC3D9',
            'a-text': '#FFFFFF',
            'a-sky': '#1a1a2e'
        };
    }
    
    // Create an A-Frame element
    createElement(type, options = {}) {
        if (!this.app.aframeManager) {
            console.error('A-Frame manager not initialized');
            return null;
        }
        
        // Handle preloaded asset types
        const assetModels = ['xbot', 'ybot', 'tree1', 'tree2', 'table', 'engine'];
        const assetSounds = ['blip1', 'blip2'];
        
        if (assetModels.includes(type)) {
            return this.createAssetModel(type, options);
        }
        
        if (assetSounds.includes(type)) {
            return this.createAssetSound(type, options);
        }

        // Some elements need a component added after the entity is created.
        // Handle those explicitly (going through the factory helpers here would
        // recurse back into createElement).
        if (type === 'animation') {
            const el = this.app.aframeManager.addEntity('a-entity', options);
            if (el) {
                el.setAttribute('animation', {
                    property: options.property || 'rotation',
                    to: options.to || '0 360 0',
                    from: options.from || '0 0 0',
                    dur: options.dur || 2000,
                    delay: options.delay || 0,
                    easing: options.easing || 'linear',
                    loop: options.loop !== undefined ? options.loop : true,
                    startEvents: options.startEvents || 'start-anim',
                    pauseEvents: options.pauseEvents || 'stop-anim'
                });
            }
            return el;
        }

        if (type === 'animation-mixer') {
            const el = this.app.aframeManager.addEntity('a-entity', options);
            if (el) el.setAttribute('animation-mixer', options.mixer || '');
            return el;
        }

        if (type === 'environment') {
            const el = this.app.aframeManager.addEntity('a-entity', options);
            if (el) {
                el.setAttribute('environment', options.environment || {
                    preset: options.preset || 'default',
                    skyType: options.skyType || 'atmosphere',
                    lighting: options.lighting || 'distant',
                    shadow: options.shadow !== undefined ? options.shadow : true,
                    fog: options.fog !== undefined ? options.fog : 0.5
                });
            }
            return el;
        }

        if (type === 'light') {
            const el = this.app.aframeManager.addEntity('a-light', options);
            if (el) el.setAttribute('type', options.type || 'point');
            return el;
        }

        if (type === 'camera') {
            const el = this.app.aframeManager.addEntity('a-entity', options);
            if (el) {
                el.setAttribute('camera', options.camera || { fov: options.fov || 80 });
                el.setAttribute('look-controls', options.lookControls || '');
                el.setAttribute('wasd-controls', options.wasdControls || '');
            }
            return el;
        }
        
        const aframeType = this.elementTypes[type] || 'a-entity';
        return this.app.aframeManager.addEntity(aframeType, options);
    }
    
    // Create primitive elements
    createBox(options = {}) {
        return this.createElement('box', {
            position: options.position || '0 0.5 -3',
            color: options.color || this.defaultColors['a-box'],
            width: options.width || 1,
            height: options.height || 1,
            depth: options.depth || 1,
            ...options
        });
    }
    
    createSphere(options = {}) {
        return this.createElement('sphere', {
            position: options.position || '0 1 -3',
            color: options.color || this.defaultColors['a-sphere'],
            radius: options.radius || 0.5,
            ...options
        });
    }
    
    createCylinder(options = {}) {
        return this.createElement('cylinder', {
            position: options.position || '0 0.75 -3',
            color: options.color || this.defaultColors['a-cylinder'],
            radius: options.radius || 0.5,
            height: options.height || 1,
            ...options
        });
    }
    
    createCone(options = {}) {
        return this.createElement('cone', {
            position: options.position || '0 0.75 -3',
            color: options.color || this.defaultColors['a-cone'],
            radiusBottom: options.radiusBottom || 0.5,
            height: options.height || 1,
            ...options
        });
    }
    
    createPlane(options = {}) {
        return this.createElement('plane', {
            position: options.position || '0 0 -3',
            rotation: options.rotation || '-90 0 0',
            color: options.color || this.defaultColors['a-plane'],
            width: options.width || 10,
            height: options.height || 10,
            ...options
        });
    }
    
    createTorus(options = {}) {
        return this.createElement('torus', {
            position: options.position || '0 1 -3',
            color: options.color || this.defaultColors['a-torus'],
            radius: options.radius || 0.5,
            radiusTubular: options.radiusTubular || 0.1,
            ...options
        });
    }
    
    createTorusKnot(options = {}) {
        return this.createElement('torus-knot', {
            position: options.position || '0 1 -3',
            color: options.color || this.defaultColors['a-torus-knot'],
            radius: options.radius || 0.3,
            radiusTubular: options.radiusTubular || 0.05,
            ...options
        });
    }
    
    createCircle(options = {}) {
        return this.createElement('circle', {
            position: options.position || '0 0 -3',
            rotation: options.rotation || '-90 0 0',
            color: options.color || this.defaultColors['a-circle'],
            radius: options.radius || 0.5,
            ...options
        });
    }
    
    createRing(options = {}) {
        return this.createElement('ring', {
            position: options.position || '0 0 -3',
            rotation: options.rotation || '-90 0 0',
            color: options.color || this.defaultColors['a-ring'],
            radiusInner: options.radiusInner || 0.3,
            radiusOuter: options.radiusOuter || 0.5,
            ...options
        });
    }
    
    createTriangle(options = {}) {
        return this.createElement('triangle', {
            position: options.position || '0 0.5 -3',
            color: options.color || this.defaultColors['a-triangle'],
            vertexA: options.vertexA || '0 1 0',
            vertexB: options.vertexB || '-1 -1 0',
            vertexC: options.vertexC || '1 -1 0',
            ...options
        });
    }
    
    // Create media elements
    createImage(options = {}) {
        return this.createElement('image', {
            position: options.position || '0 1 -3',
            src: options.src || '',
            width: options.width || 4,
            height: options.height || 3,
            ...options
        });
    }
    
    createVideo(options = {}) {
        return this.createElement('video', {
            position: options.position || '0 1 -3',
            src: options.src || '',
            width: options.width || 4,
            height: options.height || 2.25,
            loop: options.loop !== undefined ? options.loop : false,
            autoplay: options.autoplay !== undefined ? options.autoplay : false,
            ...options
        });
    }
    
    createSky(options = {}) {
        return this.createElement('sky', {
            src: options.src || '',
            color: options.color || this.defaultColors['a-sky'],
            ...options
        });
    }
    
    createVideosphere(options = {}) {
        return this.createElement('videosphere', {
            src: options.src || '',
            rotation: options.rotation || '0 0 0',
            radius: options.radius || 30,
            ...options
        });
    }
    
    createSound(options = {}) {
        // Sound needs a parent entity, so we create an entity with sound
        const entity = this.createElement('entity', {
            position: options.position || '0 1 -3',
            sound: {
                src: options.src || '',
                autoplay: options.autoplay || false,
                loop: options.loop || false,
                volume: options.volume || 1
            },
            ...options
        });
        return entity;
    }
    
    // Create text elements
    createText(options = {}) {
        return this.createElement('text', {
            position: options.position || '0 1.5 -3',
            value: options.value || 'Hello A-Frame!',
            color: options.color || this.defaultColors['a-text'],
            align: options.align || 'center',
            width: options.width || 4,
            font: options.font || 'kelsonsans',
            ...options
        });
    }
    
    createLink(options = {}) {
        return this.createElement('link', {
            position: options.position || '0 1 -3',
            href: options.href || '#',
            title: options.title || 'Link',
            image: options.image || '',
            ...options
        });
    }
    
    createCursor(options = {}) {
        // Cursor needs to be attached to camera
        const entity = this.createElement('entity', {
            cursor: {
                fuse: options.fuse !== undefined ? options.fuse : false,
                timeout: options.timeout || 1500,
                color: options.color || '#00d9ff'
            },
            raycaster: {
                objects: options.objects || '.clickable',
                far: options.far || 10
            },
            position: options.position || '0 0 -1',
            ...options
        });
        return entity;
    }
    
    // Create model elements
    createGLTFModel(options = {}) {
        return this.createElement('gltf-model', {
            position: options.position || '0 0 -3',
            src: options.src || '',
            ...options
        });
    }
    
    createOBJModel(options = {}) {
        return this.createElement('obj-model', {
            position: options.position || '0 0 -3',
            obj: options.obj || '',
            mtl: options.mtl || '',
            ...options
        });
    }
    
    // Create environment
    createEnvironment(options = {}) {
        const entity = this.createElement('entity', {
            position: options.position || '0 0 0',
            environment: {
                preset: options.preset || 'default',
                skyType: options.skyType || 'atmosphere',
                lighting: options.lighting || 'distant',
                shadow: options.shadow !== undefined ? options.shadow : true,
                fog: options.fog !== undefined ? options.fog : 0.5,
                ...options
            },
            ...options
        });
        
        // Set component directly since it's a custom component
        if (entity && options.preset) {
            entity.setAttribute('environment', {
                preset: options.preset,
                skyType: options.skyType || 'atmosphere',
                lighting: options.lighting || 'distant',
                shadow: options.shadow !== undefined ? options.shadow : true,
                fog: options.fog !== undefined ? options.fog : 0.5
            });
        }
        
        return entity;
    }
    
    // Create light
    createLight(type = 'point', options = {}) {
        return this.createElement('light', {
            position: options.position || '0 3 0',
            type: type,
            color: options.color || '#ffffff',
            intensity: options.intensity !== undefined ? options.intensity : 1,
            distance: options.distance || 0,
            angle: options.angle || Math.PI / 3,
            penumbra: options.penumbra || 0,
            decay: options.decay || 2,
            ...options
        });
    }
    
    // Create camera with controls
    createCamera(options = {}) {
        const entity = this.createElement('entity', {
            id: options.id || 'aframe-camera',
            position: options.position || '0 1.6 0',
            ...options
        });
        
        // Add camera component
        if (entity) {
            entity.setAttribute('camera', {
                fov: options.fov || 80,
                near: options.near || 0.1,
                far: options.far || 1000
            });
            
            // Add look controls
            if (options.lookControls !== false) {
                entity.setAttribute('look-controls', {
                    reverseMouseDrag: options.reverseMouseDrag || false
                });
            }
            
            // Add WASD controls
            if (options.wasdControls !== false) {
                entity.setAttribute('wasd-controls', {
                    acceleration: options.acceleration || 65,
                    fly: options.fly || false
                });
            }
            
            // Add cursor if needed
            if (options.cursor) {
                const cursor = document.createElement('a-cursor');
                cursor.setAttribute('color', options.cursor.color || '#00d9ff');
                cursor.setAttribute('fuse', options.cursor.fuse !== undefined ? options.cursor.fuse : false);
                entity.appendChild(cursor);
            }
        }
        
        return entity;
    }
    
    // Create generic entity
    createEntity(options = {}) {
        return this.createElement('entity', {
            position: options.position || '0 0 -3',
            ...options
        });
    }
    
    // Create assets container
    createAssets(options = {}) {
        // a-assets is a container, not an entity in the scene
        // It needs to be added to the scene before entities that reference it
        const scene = document.querySelector('a-scene');
        if (!scene) return null;
        
        let assets = scene.querySelector('a-assets');
        if (!assets) {
            assets = document.createElement('a-assets');
            scene.insertBefore(assets, scene.firstChild);
        }
        
        if (options.preload) {
            assets.setAttribute('preload', options.preload);
        }
        
        return assets;
    }
    
    // Create mixin definition
    createMixin(options = {}) {
        // Mixins need to be added to a-assets
        const scene = document.querySelector('a-scene');
        if (!scene) return null;
        
        let assets = scene.querySelector('a-assets');
        if (!assets) {
            assets = document.createElement('a-assets');
            scene.insertBefore(assets, scene.firstChild);
        }
        
        const mixin = document.createElement('a-mixin');
        mixin.id = options.id || 'mixin-' + Date.now();
        
        // Apply geometry
        if (options.geometry) {
            mixin.setAttribute('geometry', options.geometry);
        }
        
        // Apply material
        if (options.material) {
            mixin.setAttribute('material', options.material);
        }
        
        // Apply animation
        if (options.animation) {
            mixin.setAttribute('animation', options.animation);
        }
        
        assets.appendChild(mixin);
        return mixin;
    }
    
    // Create asset item
    createAssetItem(options = {}) {
        const scene = document.querySelector('a-scene');
        if (!scene) return null;
        
        let assets = scene.querySelector('a-assets');
        if (!assets) {
            assets = document.createElement('a-assets');
            scene.insertBefore(assets, scene.firstChild);
        }
        
        const item = document.createElement('a-asset-item');
        item.id = options.id || 'asset-' + Date.now();
        item.setAttribute('src', options.src || '');
        
        assets.appendChild(item);
        return item;
    }
    
    // Create look controls
    createLookControls(options = {}) {
        return this.createElement('look-controls', {
            position: options.position || '0 0 0',
            'look-controls': {
                reverseMouseDrag: options.reverseMouseDrag || false,
                touchEnabled: options.touchEnabled !== undefined ? options.touchEnabled : true,
                magicWindowTrackingEnabled: options.magicWindowTrackingEnabled !== undefined ? options.magicWindowTrackingEnabled : true
            },
            ...options
        });
    }
    
    // Create WASD controls
    createWasdControls(options = {}) {
        return this.createElement('wasd-controls', {
            position: options.position || '0 0 0',
            'wasd-controls': {
                acceleration: options.acceleration || 65,
                fly: options.fly || false,
                adEnabled: options.adEnabled !== undefined ? options.adEnabled : true,
                wsEnabled: options.wsEnabled !== undefined ? options.wsEnabled : true
            },
            ...options
        });
    }
    
    // Create orbit controls
    createOrbitControls(options = {}) {
        return this.createElement('orbit-controls', {
            position: options.position || '0 2 5',
            'orbit-controls': {
                target: options.target || '0 0 0',
                enableDamping: options.enableDamping !== undefined ? options.enableDamping : true,
                dampingFactor: options.dampingFactor || 0.25,
                minDistance: options.minDistance || 0.5,
                maxDistance: options.maxDistance || 180,
                initialPosition: options.initialPosition || '0 2 5'
            },
            ...options
        });
    }
    
    // Create laser controls for VR controllers
    createLaserControls(options = {}) {
        return this.createElement('laser-controls', {
            position: options.position || '0 0 0',
            'laser-controls': {
                hand: options.hand || 'right',
                model: options.model !== undefined ? options.model : true,
                raycaster: options.raycaster || {
                    far: 10,
                    objects: '.clickable'
                }
            },
            ...options
        });
    }
    
    // Create raycaster
    createRaycaster(options = {}) {
        return this.createElement('raycaster', {
            position: options.position || '0 0 0',
            raycaster: {
                objects: options.objects || '.clickable',
                far: options.far || 10,
                near: options.near || 0.1,
                interval: options.interval || 100,
                showLine: options.showLine !== undefined ? options.showLine : true,
                lineColor: options.lineColor || '#ff0000',
                lineOpacity: options.lineOpacity || 1
            },
            ...options
        });
    }
    
    // Create super-hands component
    createSuperHands(options = {}) {
        return this.createElement('super-hands', {
            position: options.position || '0 0 0',
            'super-hands': {
                colliderEvent: options.colliderEvent || ' collisions',
                colliderEventProperty: options.colliderEventProperty || ' els',
                colliderEndEvent: options.colliderEndEvent || ' collisions',
                colliderEndEventProperty: options.colliderEndEventProperty || ' clearedEls'
            },
            ...options
        });
    }
    
    // Create animation component
    createAnimation(options = {}) {
        return this.createElement('animation', {
            position: options.position || '0 0 0',
            animation: {
                property: options.property || 'rotation',
                to: options.to || '0 360 0',
                from: options.from || '0 0 0',
                dur: options.dur || 2000,
                delay: options.delay || 0,
                easing: options.easing || 'linear',
                loop: options.loop !== undefined ? options.loop : true,
                dir: options.dir || 'normal',
                startEvents: options.startEvents || '',
                pauseEvents: options.pauseEvents || '',
                resumeEvents: options.resumeEvents || ''
            },
            ...options
        });
    }
    
    // Create animation-mixer for GLTF animations
    createAnimationMixer(options = {}) {
        return this.createElement('animation-mixer', {
            position: options.position || '0 0 0',
            'animation-mixer': {
                clip: options.clip || '*',
                loop: options.loop || 'repeat',
                crossFadeDuration: options.crossFadeDuration || 0,
                timeScale: options.timeScale || 1
            },
            ...options
        });
    }
    
    // Create hand controls for VR
    createHandControls(side = 'left', options = {}) {
        const entity = this.createElement('entity', {
            position: options.position || '0 0 0',
            handControls: {
                hand: side,
                handModelStyle: options.handModelStyle || 'lowPoly',
                color: options.color || '#ffcccc'
            },
            ...options
        });
        
        return entity;
    }
    
    // Create model from preloaded assets
    createAssetModel(assetId, options = {}) {
        return this.createElement('gltf-model', {
            position: options.position || '0 0 -3',
            src: '#' + assetId,
            ...options
        });
    }
    
    // Create Xbot model (animated character)
    createXbot(options = {}) {
        return this.createAssetModel('xbot', {
            position: options.position || '0 0 -3',
            scale: options.scale || '0.5 0.5 0.5',
            animation: options.animation ? {
                property: options.animation.property || 'position',
                to: options.animation.to || '0 0.1 -3',
                dur: options.animation.dur || 1000,
                loop: options.animation.loop !== undefined ? options.animation.loop : true,
                easing: options.animation.easing || 'linear'
            } : null,
            'animation-mixer': options.animationMixer || null,
            ...options
        });
    }
    
    // Create Ybot model (animated character)
    createYbot(options = {}) {
        return this.createAssetModel('ybot', {
            position: options.position || '0 0 -3',
            scale: options.scale || '0.5 0.5 0.5',
            'animation-mixer': options.animationMixer || null,
            ...options
        });
    }
    
    // Create tree1 model
    createTree1(options = {}) {
        return this.createAssetModel('tree1', {
            position: options.position || '0 0 -5',
            scale: options.scale || '1 1 1',
            ...options
        });
    }
    
    // Create tree2 model
    createTree2(options = {}) {
        return this.createAssetModel('tree2', {
            position: options.position || '0 0 -5',
            scale: options.scale || '1 1 1',
            ...options
        });
    }
    
    // Create table model
    createTable(options = {}) {
        return this.createAssetModel('table', {
            position: options.position || '0 0 -3',
            scale: options.scale || '1 1 1',
            ...options
        });
    }
    
    // Create engine model
    createEngine(options = {}) {
        return this.createAssetModel('engine', {
            position: options.position || '0 0 -3',
            scale: options.scale || '1 1 1',
            ...options
        });
    }
    
    // Create sound from preloaded assets
    createAssetSound(assetId, options = {}) {
        return this.createElement('entity', {
            position: options.position || '0 1 -3',
            sound: {
                src: '#' + assetId,
                autoplay: options.autoplay || false,
                loop: options.loop || false,
                volume: options.volume || 1,
                poolSize: options.poolSize || 3
            },
            ...options
        });
    }
    
    // Create blip1 sound
    createBlip1(options = {}) {
        return this.createAssetSound('blip1', options);
    }
    
    // Create blip2 sound
    createBlip2(options = {}) {
        return this.createAssetSound('blip2', options);
    }
    
    // Get available preloaded assets
    getPreloadedAssets() {
        return {
            models: ['engine', 'table', 'tree1', 'tree2', 'xbot', 'ybot'],
            audio: ['blip1', 'blip2']
        };
    }
    
    // Get element type from tag name
    getElementType(tagName) {
        for (const [key, value] of Object.entries(this.elementTypes)) {
            if (value === tagName) {
                return key;
            }
        }
        return 'entity';
    }
    
    // Get all supported element types
    getSupportedTypes() {
        return Object.keys(this.elementTypes);
    }
}

// Export a global instance
window.AFrameFactory = AFrameFactory;
