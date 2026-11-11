/**
 * A-Frame Scene Manager
 * Manages the A-Frame scene, entities, and VR functionality
 * Works alongside the existing Three.js editor
 */

export class AFrameSceneManager {
    constructor(app) {
        this.app = app;
        this.scene = null;
        this.sceneRoot = null;
        this.cameraRig = null;
        this.isAFrameMode = false;
        this.selectedEntity = null;
        this.entities = [];
        
        // Asset management
        this.assets = [];
        
        // Initialize when A-Frame is ready
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready and A-Frame to load
        const checkAFrame = () => {
            const scene = document.getElementById('aframe-scene');
            if (scene && window.AFRAME) {
                this.setupScene();
            } else {
                setTimeout(checkAFrame, 100);
            }
        };
        checkAFrame();
    }
    
    setupScene() {
        this.scene = document.getElementById('aframe-scene');
        this.sceneRoot = document.getElementById('aframe-scene-root');
        this.cameraRig = document.getElementById('aframe-camera-rig');
        
        // Preload example assets
        this.preloadAssets();
        
        // Set up event listeners
        this.setupEventListeners();

        // Keep user-defined mixins in the scene's <a-assets>.
        this.app.mixinSystem?.syncScene();
        
        console.log('A-Frame scene initialized');
    }
    
    // Preload example assets
    preloadAssets() {
        if (!this.scene) return;
        
        let assets = this.scene.querySelector('a-assets');
        if (!assets) {
            assets = document.createElement('a-assets');
            this.scene.insertBefore(assets, this.scene.firstChild);
        }
        
        // Preload audio files
        const audioFiles = [
            { id: 'blip1', src: 'assets/aframe/audio/321103__nsstudios__blip1.wav' },
            { id: 'blip2', src: 'assets/aframe/audio/321104__nsstudios__blip2.wav' }
        ];
        
        audioFiles.forEach(audio => {
            const audioEl = document.createElement('audio');
            audioEl.id = audio.id;
            audioEl.src = audio.src;
            audioEl.preload = 'auto';
            assets.appendChild(audioEl);
        });
        
        // Preload GLTF models
        const modelFiles = [
            { id: 'engine', src: 'assets/aframe/models/engine.glb' },
            { id: 'table', src: 'assets/aframe/models/table.glb' },
            { id: 'tree1', src: 'assets/aframe/models/tree1.glb' },
            { id: 'tree2', src: 'assets/aframe/models/tree2.glb' },
            { id: 'xbot', src: 'assets/aframe/models/Xbot.glb' },
            { id: 'ybot', src: 'assets/aframe/models/Ybot.glb' }
        ];
        
        modelFiles.forEach(model => {
            const assetItem = document.createElement('a-asset-item');
            assetItem.id = model.id;
            assetItem.src = model.src;
            assets.appendChild(assetItem);
        });
        
        console.log('Preloaded A-Frame assets:', audioFiles.length + ' audio, ' + modelFiles.length + ' models');
    }
    
    setupEventListeners() {
        if (!this.scene) return;
        
        // Listen for VR mode changes
        this.scene.addEventListener('enter-vr', () => {
            console.log('Entered VR mode');
            this.app.ui?.showNotification('Entered VR mode', 'success');
        });
        
        this.scene.addEventListener('exit-vr', () => {
            console.log('Exited VR mode');
            this.app.ui?.showNotification('Exited VR mode', 'info');
        });
        
        // Entity click selection
        this.scene.addEventListener('click', (evt) => {
            if (evt.target !== this.scene) {
                this.selectEntity(evt.target);
            }
        });
        
        // Check VR capabilities
        this.checkVRCapabilities();
    }
    
    checkVRCapabilities() {
        if (!this.scene) return;
        
        // Check if VR is available
        this.scene.addEventListener('loaded', () => {
            const vrAvailable = this.scene.is('vr-mode-available');
            const arAvailable = this.scene.is('ar-mode-available');
            
            console.log('VR available:', vrAvailable);
            console.log('AR available:', arAvailable);
            
            // Update button states
            const vrBtn = document.getElementById('btn-enter-vr');
            const arBtn = document.getElementById('btn-enter-ar');
            
            if (vrBtn) {
                vrBtn.disabled = !vrAvailable;
                vrBtn.title = vrAvailable ? 'Enter VR (F5)' : 'VR not available';
            }
            
            if (arBtn) {
                arBtn.disabled = !arAvailable;
                arBtn.title = arAvailable ? 'Enter AR' : 'AR not available';
            }
        });
    }
    
    // Toggle between Three.js and A-Frame mode
    toggleAFrameMode(enable) {
        const threeContainer = document.getElementById('canvas-container');
        const aframeScene = document.getElementById('aframe-scene');
        const aframeBtn = document.getElementById('btn-aframe-mode');
        
        this.isAFrameMode = enable;
        
        if (enable) {
            // Show A-Frame, hide Three.js
            threeContainer.style.display = 'none';
            aframeScene.style.display = 'block';
            
            if (aframeBtn) {
                aframeBtn.classList.add('active');
                aframeBtn.innerHTML = '<i class="fas fa-vr-cardboard"></i> A-Frame ✓';
            }
            
            // Resize A-Frame scene
            this.scene.emit('resize');
            
            // Sync layer manager with A-Frame entities
            this.app.layerManager?.setAFrameMode(true);
            this.app.layerManager?.renderAFrameEntities();

            // Show the A-Frame world settings when entering the builder.
            this.app.ui?.renderAFramePropertiesPanel?.(null);
            
            this.app.ui?.showNotification('A-Frame mode enabled', 'success');
        } else {
            // Show Three.js, hide A-Frame
            threeContainer.style.display = 'block';
            aframeScene.style.display = 'none';
            
            if (aframeBtn) {
                aframeBtn.classList.remove('active');
                aframeBtn.innerHTML = '<i class="fas fa-vr-cardboard"></i> A-Frame';
            }
            
            // Sync layer manager with Three.js objects
            this.app.layerManager?.setAFrameMode(false);
            this.app.layerManager?.render();

            // Restore the Three.js properties view.
            this.app.ui?.updateUI?.(this.app.selectedObject || null);
            
            // Trigger Three.js resize
            this.app.onWindowResize?.();
            
            this.app.ui?.showNotification('Three.js mode enabled', 'info');
        }
        
        return this.isAFrameMode;
    }
    
    // Enter VR mode
    enterVR() {
        if (this.scene && this.scene.is('vr-mode-available')) {
            this.scene.enterVR();
        } else {
            this.app.ui?.showNotification('VR mode not available', 'error');
        }
    }
    
    // Enter AR mode
    enterAR() {
        if (this.scene && this.scene.is('ar-mode-available')) {
            this.scene.enterAR();
        } else {
            this.app.ui?.showNotification('AR mode not available', 'error');
        }
    }
    
    // Exit VR mode
    exitVR() {
        if (this.scene && this.scene.is('vr-mode')) {
            this.scene.exitVR();
        }
    }
    
    // Add entity to scene
    addEntity(type, properties = {}) {
        if (!this.sceneRoot) return null;
        
        const el = document.createElement(type);
        if (!el.id) {
            el.id = type.replace('a-', '') + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5);
        }
        
        // Apply default properties
        if (properties.position) {
            el.setAttribute('position', properties.position);
        } else {
            el.setAttribute('position', '0 1 -3');
        }
        
        if (properties.rotation) {
            el.setAttribute('rotation', properties.rotation);
        }
        
        if (properties.scale) {
            el.setAttribute('scale', properties.scale);
        }
        
        // Apply type-specific defaults
        switch (type) {
            case 'a-box':
                el.setAttribute('color', properties.color || '#4CC3D9');
                el.setAttribute('material', properties.material || 'color: #4CC3D9; metalness: 0.3; roughness: 0.5');
                break;
            case 'a-sphere':
                el.setAttribute('radius', properties.radius || '0.5');
                el.setAttribute('color', properties.color || '#EF2D5E');
                break;
            case 'a-cylinder':
                el.setAttribute('radius', properties.radius || '0.5');
                el.setAttribute('height', properties.height || '1');
                el.setAttribute('color', properties.color || '#FFC65D');
                break;
            case 'a-cone':
                el.setAttribute('radius-bottom', properties.radiusBottom || '0.5');
                el.setAttribute('height', properties.height || '1');
                el.setAttribute('color', properties.color || '#7BC8A4');
                break;
            case 'a-plane':
                el.setAttribute('width', properties.width || '10');
                el.setAttribute('height', properties.height || '10');
                el.setAttribute('rotation', '-90 0 0');
                el.setAttribute('color', properties.color || '#333333');
                break;
            case 'a-text':
                el.setAttribute('value', properties.value || 'Hello A-Frame!');
                el.setAttribute('color', properties.color || '#FFFFFF');
                el.setAttribute('align', properties.align || 'center');
                break;
            case 'a-sky':
                el.setAttribute('color', properties.color || '#1a1a2e');
                break;
            case 'a-image':
                el.setAttribute('src', properties.src || '');
                el.setAttribute('width', properties.width || '4');
                el.setAttribute('height', properties.height || '3');
                break;
            case 'a-video':
                el.setAttribute('src', properties.src || '');
                el.setAttribute('width', properties.width || '4');
                el.setAttribute('height', properties.height || '3');
                break;
            case 'a-videosphere':
                el.setAttribute('src', properties.src || '');
                break;
            case 'a-circle':
                el.setAttribute('radius', properties.radius || '1');
                el.setAttribute('color', properties.color || '#4CC3D9');
                break;
            case 'a-ring':
                el.setAttribute('radius-inner', properties.radiusInner || '0.5');
                el.setAttribute('radius-outer', properties.radiusOuter || '1');
                el.setAttribute('color', properties.color || '#4CC3D9');
                break;
            case 'a-torus-knot':
                el.setAttribute('radius', properties.radius || '0.5');
                el.setAttribute('radius-tubular', properties.radiusTubular || '0.1');
                el.setAttribute('color', properties.color || '#4CC3D9');
                break;
            case 'a-gltf-model':
                el.setAttribute('src', properties.src || '');
                break;
            case 'a-sound':
                el.setAttribute('src', properties.src || '');
                el.setAttribute('autoplay', properties.autoplay || 'false');
                el.setAttribute('loop', properties.loop || 'false');
                break;
        }
        
        // Add class for selection
        el.classList.add('selectable-entity');
        
        // Add click listener for selection
        el.addEventListener('click', (evt) => {
            evt.stopPropagation();
            this.selectEntity(el);
        });
        
        // Add to scene
        this.sceneRoot.appendChild(el);
        
        // Track entity
        this.entities.push({
            id: el.id || 'entity-' + Date.now(),
            element: el,
            type: type
        });
        
        // Refresh layer list if in A-Frame mode
        if (this.isAFrameMode) {
            this.app.layerManager?.renderAFrameEntities();
        }
        
        return el;
    }
    
    // Remove entity from scene
    removeEntity(el) {
        if (!el) return;
        
        // Remove from tracked entities
        const idx = this.entities.findIndex(e => e.element === el);
        if (idx > -1) {
            this.entities.splice(idx, 1);
        }
        
        // Remove from scene
        if (el.parentNode) {
            el.parentNode.removeChild(el);
        }
        
        // If it was selected, deselect
        if (this.selectedEntity === el) {
            this.deselectEntity();
        }
        
        // Refresh layer list if in A-Frame mode
        if (this.isAFrameMode) {
            this.app.layerManager?.renderAFrameEntities();
        }
    }
    
    // Select entity
    selectEntity(el) {
        // Deselect previous
        this.deselectEntity();
        
        if (!el) return;
        
        this.selectedEntity = el;
        
        // Add visual selection indicator
        el.classList.add('selected');
        
        // Emit event for UI update
        window.dispatchEvent(new CustomEvent('aframe-entity-selected', {
            detail: { entity: el }
        }));
        
        // Refresh layer list to show selection
        if (this.isAFrameMode) {
            this.app.layerManager?.renderAFrameEntities();
        }
        
        console.log('Selected entity:', el.tagName, el.id);
    }
    
    // Deselect entity
    deselectEntity() {
        if (this.selectedEntity) {
            this.selectedEntity.classList.remove('selected');
            this.selectedEntity = null;
            
            // Emit event
            window.dispatchEvent(new CustomEvent('aframe-entity-deselected'));
            
            // Refresh layer list
            if (this.isAFrameMode) {
                this.app.layerManager?.renderAFrameEntities();
            }
        }
    }
    
    // Get entity properties for the UI
    getEntityProperties(el) {
        if (!el) return null;
        
        const props = {
            tagName: el.tagName,
            id: el.id,
            position: el.getAttribute('position') || '0 0 0',
            rotation: el.getAttribute('rotation') || '0 0 0',
            scale: el.getAttribute('scale') || '1 1 1',
            visible: el.getAttribute('visible') !== false,
            components: {}
        };
        
        // Get all components
        for (const name in el.components) {
            if (el.components[name] && el.components[name].data) {
                props.components[name] = el.components[name].data;
            }
        }
        
        // Get geometry properties
        const geometry = el.getAttribute('geometry');
        if (geometry) {
            props.geometry = geometry;
        }
        
        // Get material properties
        const material = el.getAttribute('material');
        if (material) {
            props.material = material;
        }
        
        // Get animation
        const animation = el.getAttribute('animation');
        if (animation) {
            props.animation = animation;
        }
        
        return props;
    }
    
    // Update entity property
    updateEntityProperty(el, property, value) {
        if (!el) return;
        
        el.setAttribute(property, value);
        
        // Emit update event
        window.dispatchEvent(new CustomEvent('aframe-entity-updated', {
            detail: { entity: el, property, value }
        }));
    }
    
    // Add asset to assets container
    addAsset(id, src, type = 'image') {
        const scene = document.getElementById('aframe-scene');
        if (!scene) return null;
        
        let assets = scene.querySelector('a-assets');
        if (!assets) {
            assets = document.createElement('a-assets');
            scene.insertBefore(assets, scene.firstChild);
        }
        
        let assetEl;
        switch (type) {
            case 'image':
                assetEl = document.createElement('img');
                assetEl.id = id;
                assetEl.src = src;
                break;
            case 'audio':
                assetEl = document.createElement('audio');
                assetEl.id = id;
                assetEl.src = src;
                break;
            case 'video':
                assetEl = document.createElement('video');
                assetEl.id = id;
                assetEl.src = src;
                break;
            case 'model':
                assetEl = document.createElement('a-asset-item');
                assetEl.id = id;
                assetEl.src = src;
                break;
            default:
                assetEl = document.createElement('img');
                assetEl.id = id;
                assetEl.src = src;
        }
        
        assets.appendChild(assetEl);
        
        this.assets.push({ id, src, type, element: assetEl });
        
        return assetEl;
    }
    
    // Get all entities
    getAllEntities() {
        return this.entities;
    }
    
    // Get selected entity
    getSelectedEntity() {
        return this.selectedEntity;
    }
    
    // Clear all entities
    clearScene() {
        if (!this.sceneRoot) return;
        
        // Remove all children
        while (this.sceneRoot.firstChild) {
            this.sceneRoot.removeChild(this.sceneRoot.firstChild);
        }
        
        // Clear tracked entities
        this.entities = [];
        
        // Deselect
        this.deselectEntity();
    }
    
    // Play all animations in the scene
    playAnimations() {
        if (!this.scene) {
            this.app.ui?.showNotification('A-Frame scene not loaded', 'error');
            return;
        }
        
        // Get all entities with animations
        const entities = this.scene.querySelectorAll('[animation]');
        
        if (entities.length === 0) {
            this.app.ui?.showNotification('No animations to play', 'info');
            return;
        }
        
        // Resume all animations
        entities.forEach(el => {
            // Check if animation is paused
            const animation = el.components.animation;
            if (animation && animation.animation) {
                animation.animation.play();
            }
        });
        
        // Update UI to show playing state
        const playBtn = document.getElementById('btn-aframe-play');
        const stopBtn = document.getElementById('btn-aframe-stop');
        
        if (playBtn) {
            playBtn.classList.add('playing');
            playBtn.querySelector('i').classList.remove('fa-play');
            playBtn.querySelector('i').classList.add('fa-pause');
        }
        
        this.app.ui?.showNotification(`Playing ${entities.length} animation(s)`, 'success');
    }
    
    // Stop all animations in the scene
    stopAnimations() {
        if (!this.scene) return;
        
        // Get all entities with animations
        const entities = this.scene.querySelectorAll('[animation]');
        
        // Pause all animations
        entities.forEach(el => {
            const animation = el.components.animation;
            if (animation && animation.animation) {
                animation.animation.pause();
            }
        });
        
        // Update UI to show stopped state
        const playBtn = document.getElementById('btn-aframe-play');
        const stopBtn = document.getElementById('btn-aframe-stop');
        
        if (playBtn) {
            playBtn.classList.remove('playing');
            playBtn.querySelector('i').classList.add('fa-play');
            playBtn.querySelector('i').classList.remove('fa-pause');
        }
        
        this.app.ui?.showNotification('Animations stopped', 'info');
    }
    
    // Get all entities as JSON data (for save/load)
    getEntities() {
        if (!this.sceneRoot) return [];
        
        const entities = [];
        const children = this.sceneRoot.children;
        
        for (let i = 0; i < children.length; i++) {
            const el = children[i];
            const entityData = this.serializeEntity(el);
            if (entityData) {
                entities.push(entityData);
            }
        }
        
        return entities;
    }
    
    // Serialize an A-Frame entity to JSON
    serializeEntity(el) {
        if (!el || !el.tagName) return null;
        
        const tagName = el.tagName.toLowerCase();
        
        // Skip system entities
        const skipTags = ['a-assets', 'a-sky', 'a-camera', 'a-light', 'a-entity'];
        if (skipTags.includes(tagName)) {
            // But check if it has meaningful content
            if (!el.hasAttributes() && el.children.length === 0) return null;
        }
        
        const data = {
            type: 'aframe-element',
            tagName: tagName,
            position: el.getAttribute('position') || '0 0 0',
            rotation: el.getAttribute('rotation') || '0 0 0',
            scale: el.getAttribute('scale') || '1 1 1'
        };
        
        // Get all attributes
        for (let j = 0; j < el.attributes.length; j++) {
            const attr = el.attributes[j];
            if (attr.name !== 'class' || (attr.value && !attr.value.includes('selectable'))) {
                data[attr.name] = attr.value;
            }
        }
        
        return data;
    }
    
    // Load entities from JSON data
    loadEntities(entitiesData) {
        if (!this.sceneRoot || !entitiesData || !Array.isArray(entitiesData)) return;
        
        // Clear existing entities first
        this.clearScene();
        
        entitiesData.forEach(data => {
            if (data.type === 'aframe-element') {
                this.createEntityFromData(data);
            }
        });
        
        console.log('Loaded', entitiesData.length, 'A-Frame entities');
        
        // Refresh layer list
        if (this.isAFrameMode) {
            this.app.layerManager?.renderAFrameEntities();
        }
    }
    
    // Create an entity from serialized data
    createEntityFromData(data) {
        if (!data || !data.tagName) return null;
        
        const el = document.createElement(data.tagName);
        
        // Set transform attributes
        if (data.position) el.setAttribute('position', data.position);
        if (data.rotation) el.setAttribute('rotation', data.rotation);
        if (data.scale) el.setAttribute('scale', data.scale);
        
        // Set all other attributes
        const skipAttrs = ['type', 'tagName', 'position', 'rotation', 'scale'];
        Object.keys(data).forEach(key => {
            if (!skipAttrs.includes(key)) {
                el.setAttribute(key, data[key]);
            }
        });
        
        // Add selection class
        el.classList.add('selectable-entity');
        
        // Add click listener
        el.addEventListener('click', (evt) => {
            evt.stopPropagation();
            this.selectEntity(el);
        });
        
        this.sceneRoot.appendChild(el);
        
        // Track entity
        this.entities.push({
            id: el.id || 'entity-' + Date.now(),
            element: el,
            type: data.tagName
        });
        
        return el;
    }
    
    // Export scene as HTML
    exportAsHTML() {
        let html = '';
        
        // Get the scene content
        if (this.sceneRoot) {
            html = this.sceneRoot.innerHTML;
        }
        
        return html;
    }
}

// Export a global instance
window.AFrameSceneManager = AFrameSceneManager;
