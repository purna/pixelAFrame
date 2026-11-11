import { AFrameFeatureScript } from './aframeFeatures.js';

export class FileManager {
    constructor(app) {
        this.app = app;
        this.autosaveEnabled = false;
        this.autosaveInterval = 5; // minutes
        this.autosaveTimer = null;
    }

    saveScene() {
        const data = [];
        
        // Helper to serialize an object
        const processObj = (obj) => {
            // Only process objects with our specific types
            if (obj.userData.type) {
                const item = {
                    type: obj.userData.type,
                    position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
                    rotation: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z },
                    scale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z },
                    userData: obj.userData
                };

                if (obj.userData.type === 'shape') {
                    item.shapeType = obj.userData.shapeType;
                    item.color = '#' + obj.material.color.getHexString();
                } else if (obj.userData.type === 'light') {
                    const l = obj.children[0];
                    item.lightType = obj.userData.lightType;
                    item.color = '#' + l.color.getHexString();
                    item.intensity = l.intensity;
                }
                data.push(item);
            }
        };

        // Traverse only direct children of scene to find our managed roots
        this.app.scene.children.forEach(child => {
            processObj(child);
        });

        // Include A-Frame entities if in A-Frame mode
        if (this.app.aframeManager && this.app.aframeManager.isAFrameMode) {
            const aframeEntities = this.app.aframeManager.getEntities();
            aframeEntities.forEach(entity => {
                data.push(entity);
            });
        }

        // Include reusable A-Frame assets and mixins.
        this.app.assetSystem?.getAssets().forEach(asset => {
            data.push({ type: 'aframe-asset', asset });
        });
        this.app.mixinSystem?.getMixins().forEach(mixin => {
            data.push({ type: 'aframe-mixin', mixin });
        });

        const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'scene.json';
        a.click();
        
        // Cleanup
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    saveToBrowser() {
        const data = [];
        
        // Helper to serialize an object
        const processObj = (obj) => {
            // Only process objects with our specific types
            if (obj.userData.type) {
                const item = {
                    type: obj.userData.type,
                    position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
                    rotation: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z },
                    scale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z },
                    userData: obj.userData
                };

                if (obj.userData.type === 'shape') {
                    item.shapeType = obj.userData.shapeType;
                    item.color = '#' + obj.material.color.getHexString();
                } else if (obj.userData.type === 'light') {
                    const l = obj.children[0];
                    item.lightType = obj.userData.lightType;
                    item.color = '#' + l.color.getHexString();
                    item.intensity = l.intensity;
                }
                data.push(item);
            }
        };

        // Traverse only direct children of scene to find our managed roots
        this.app.scene.children.forEach(child => {
            processObj(child);
        });

        // Include A-Frame entities
        if (this.app.aframeManager && this.app.aframeManager.isAFrameMode) {
            const aframeEntities = this.app.aframeManager.getEntities();
            aframeEntities.forEach(entity => {
                data.push(entity);
            });
        }

        this.app.assetSystem?.getAssets().forEach(asset => {
            data.push({ type: 'aframe-asset', asset });
        });
        this.app.mixinSystem?.getMixins().forEach(mixin => {
            data.push({ type: 'aframe-mixin', mixin });
        });

        // Save to localStorage
        localStorage.setItem('pixelAFrame-scene', JSON.stringify(data));
        this.saveFolderStructure();
        
        // Show notification
        if (this.app.ui) {
            this.app.ui.showNotification('Scene saved to browser!', 'success');
        }
    }

    // Save folder structure
    saveFolderStructure() {
        if (!this.app.layerManager) return;

        const folderData = this.app.layerManager.folders.map(folder => ({
            id: folder.id,
            name: folder.name,
            expanded: folder.expanded,
            objects: folder.objects.map(obj => obj.id || Math.random().toString(36).substr(2, 9))
        }));

        localStorage.setItem('pixelAFrame-folders', JSON.stringify(folderData));
    }

    // Load folder structure
    loadFolderStructure() {
        if (!this.app.layerManager) return;

        const saved = localStorage.getItem('pixelAFrame-folders');
        if (saved) {
            try {
                const folderData = JSON.parse(saved);
                this.app.layerManager.folders = folderData.map(folder => ({
                    id: folder.id,
                    name: folder.name,
                    expanded: folder.expanded || true,
                    objects: []
                }));
                this.app.layerManager.render();
            } catch (err) {
                console.error("Failed to load folder structure:", err);
            }
        }
    }

    // Autosave methods
    setAutosaveEnabled(enabled) {
        this.autosaveEnabled = enabled;
        if (enabled) {
            this.startAutosave();
        } else {
            this.stopAutosave();
        }
    }

    setAutosaveInterval(minutes) {
        this.autosaveInterval = minutes;
        if (this.autosaveEnabled) {
            this.startAutosave(); // Restart with new interval
        }
    }

    startAutosave() {
        this.stopAutosave(); // Clear any existing timer
        this.autosaveTimer = setInterval(() => {
            this.saveToBrowser();
            if (this.app.ui && this.app.ui.showNotification) {
                this.app.ui.showNotification('Scene autosaved!', 'success');
            }
        }, this.autosaveInterval * 60 * 1000); // Convert minutes to milliseconds
    }

    stopAutosave() {
        if (this.autosaveTimer) {
            clearInterval(this.autosaveTimer);
            this.autosaveTimer = null;
        }
    }

    loadScene(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.loadData(data); // Refactored to separate method so AI can call it
            } catch (err) {
                console.error("Failed to load scene:", err);
                // Note: FileManager doesn't have access to UI, so alerts are still used here
                alert("Error loading scene file");
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset input
    }

    // New helper that accepts raw data (used by File Input AND Gemini AI)
    loadData(data) {
        this.app.clearScene();
        
        // Separate Three.js objects, A-Frame elements, assets and mixins.
        const assetData = data.filter(item => item.type === 'aframe-asset');
        const mixinData = data.filter(item => item.type === 'aframe-mixin');
        const threeJSData = data.filter(item =>
            !['aframe-element', 'aframe-asset', 'aframe-mixin'].includes(item.type)
        );
        const aframeData = data.filter(item => item.type === 'aframe-element');

        assetData.forEach(item => {
            if (item.asset) this.app.assetSystem?.addAsset(item.asset);
        });

        // Load mixins before entities so entity mixin references resolve.
        mixinData.forEach(item => {
            if (!item.mixin) return;
            const existing = this.app.mixinSystem?.getMixin(item.mixin.id);
            if (existing) this.app.mixinSystem.updateMixin(item.mixin.id, item.mixin);
            else this.app.mixinSystem?.createMixin(item.mixin);
        });
        
        let loadedCount = 0;
        
        // Load Three.js objects
        threeJSData.forEach(item => {
            let newObj = null;

            if (item.type === 'shape') {
                this.app.addShape(item.shapeType);
                newObj = this.app.selectedObject;
                if (newObj && item.color) newObj.material.color.set(item.color);
            } 
            else if (item.type === 'light') {
                this.app.addLight(item.lightType);
                newObj = this.app.selectedObject;
                if (newObj) {
                    newObj.children[0].color.set(item.color);
                    newObj.children[0].intensity = item.intensity;
                }
            }

            if (newObj) {
                if (item.position) newObj.position.set(item.position.x, item.position.y, item.position.z);
                if (item.rotation) newObj.rotation.set(item.rotation.x, item.rotation.y, item.rotation.z);
                if (item.scale) newObj.scale.set(item.scale.x, item.scale.y, item.scale.z);
                loadedCount++;
            }
        });
        
        // Load A-Frame elements (switch to A-Frame mode first)
        if (aframeData.length > 0) {
            if (!this.app.aframeManager.isAFrameMode) {
                this.app.aframeManager.toggleAFrameMode(true);
            }
            this.app.aframeManager.loadEntities(aframeData);
            loadedCount += aframeData.length;
        }
        
        this.app.deselect(); // Clear selection after loading
        
        // Show notification via UI (if available)
        if (this.app.ui && this.app.ui.showNotification) {
            this.app.ui.showNotification(`Scene loaded! (${loadedCount} objects)`, 'success');
        }

        // Load folder structure and restore object organization
        this.loadFolderStructure();
        this.restoreObjectsToFolders();
    }
    
    // Load from browser storage
    loadFromBrowser() {
        const saved = localStorage.getItem('pixelAFrame-scene');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.loadData(data);
                return true;
            } catch (err) {
                console.error('Failed to load scene from browser:', err);
                return false;
            }
        }
        return false;
    }
    
    // Check if there's a saved scene in browser
    hasSavedScene() {
        return localStorage.getItem('pixelAFrame-scene') !== null;
    }

    // Export scene as A-Frame HTML file (zipped)
    exportAsAFrameHTML() {
        const aframeEntities = this.app.aframeManager?.getEntities() || [];
        
        if (aframeEntities.length === 0) {
            if (this.app.ui) {
                this.app.ui.showNotification('No A-Frame elements to export. Add some A-Frame elements first.', 'info');
            }
            return;
        }

        // Check if JSZip is available, load it if not
        if (typeof JSZip === 'undefined') {
            this.loadJSZip().then(() => {
                this.doExportAsZip(aframeEntities);
            }).catch(err => {
                console.error('Failed to load JSZip:', err);
                // Fallback to single HTML file
                this.exportAsSingleHTML(aframeEntities);
            });
        } else {
            this.doExportAsZip(aframeEntities);
        }
    }
    
    // Load JSZip from CDN
    loadJSZip() {
        return new Promise((resolve, reject) => {
            if (typeof JSZip !== 'undefined') {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    // Do the actual ZIP export
    doExportAsZip(entities) {
        const zip = new JSZip();
        
        // Generate the HTML content
        const htmlContent = this.generateAFrameHTML(entities);
        
        // Add index.html to zip
        zip.file('index.html', htmlContent);
        
        // Add reusable assets that were uploaded as data URLs.
        const assets = zip.folder('assets');
        const zipAssets = this.app.assetSystem?.getZipAssets() || [];
        zipAssets.forEach(asset => {
            assets.file(asset.filename, asset.content, asset.base64 ? { base64: true } : undefined);
        });

        // Project data for re-importing into the editor.
        zip.file('project.json', JSON.stringify({
            entities,
            assets: this.app.assetSystem?.getAssets() || [],
            mixins: this.app.mixinSystem?.getMixins() || []
        }, null, 2));
        
        // Create css folder with basic styles
        const css = zip.folder('css');
        css.file('style.css', this.generateExportStyles());
        
        // Create js folder
        const js = zip.folder('js');
        
        // Generate the ZIP file
        zip.generateAsync({type: 'blob'}).then(content => {
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'aframe-scene.zip';
            a.click();
            
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            
            if (this.app.ui) {
                this.app.ui.showNotification('A-Frame scene exported as ZIP!', 'success');
            }
        });
    }
    
    // Export a single standalone HTML file (assets are embedded as data URLs).
    exportHTMLFile() {
        const entities = this.app.aframeManager?.getEntities() || [];
        const htmlContent = this.generateAFrameHTML(entities);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'aframe-scene.html';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        if (this.app.ui) this.app.ui.showNotification('HTML file exported!', 'success');
    }

    // Fallback: export as single HTML file
    exportAsSingleHTML(entities) {
        const htmlContent = this.generateAFrameHTML(entities);
        
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'aframe-scene.html';
        a.click();
        
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
        if (this.app.ui) {
            this.app.ui.showNotification('A-Frame scene exported!', 'success');
        }
    }
    
    // Generate CSS for exported scene
    generateExportStyles() {
        return `/* A-Frame Scene Styles */
body {
    margin: 0;
    padding: 0;
    overflow: hidden;
}

.a-enter-vr-button {
    bottom: 20px;
    right: 20px;
}

/* Loading screen styles */
.a-loader-overlay {
    background: #1a1a1a;
}
`;
    }

    // Generate complete A-Frame HTML document
    generateAFrameHTML(entities) {
        let entitiesHTML = '';

        const escapeAttr = (value) => String(value)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        entities.forEach(entity => {
            const tagName = entity.tagName || 'a-entity';
            let attrs = '';
            
            // Add transform attributes
            if (entity.position) attrs += ` position="${escapeAttr(entity.position)}"`;
            if (entity.rotation) attrs += ` rotation="${escapeAttr(entity.rotation)}"`;
            if (entity.scale) attrs += ` scale="${escapeAttr(entity.scale)}"`;
            
            // Add all other attributes
            Object.keys(entity).forEach(key => {
                if (key !== 'type' && key !== 'tagName' && key !== 'position' && key !== 'rotation' && key !== 'scale') {
                    attrs += ` ${key}="${escapeAttr(entity[key])}"`;
                }
            });
            
            entitiesHTML += `    <${tagName}${attrs}></${tagName}>\n`;
        });

        // Keep scene-wide settings (fog, shadows) in the exported project.
        const sceneEl = document.getElementById('aframe-scene');
        let sceneAttrs = '';
        ['fog', 'shadow', 'background', 'environment'].forEach(name => {
            const attr = sceneEl && sceneEl.attributes.getNamedItem(name);
            if (attr) sceneAttrs += ` ${name}="${attr.value}"`;
        });

        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>A-Frame Scene Export</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- A-Frame VR Library -->
    <script src="https://aframe.io/releases/1.5.0/aframe.min.js"></script>
    <!-- A-Frame Extras -->
    <script src="https://cdn.jsdelivr.net/gh/c-frame/aframe-extras@7.2.0/dist/aframe-extras.min.js"></script>
    <!-- A-Frame Environment Component -->
    <script src="https://unpkg.com/aframe-environment-component@1.3.3/dist/aframe-environment-component.min.js"></script>
    <!-- Pixel AFrame behaviours and particle effects -->
    <script>${AFrameFeatureScript}</script>
</head>
<body>
    <a-scene${sceneAttrs}>
        <a-assets>
            <!-- Student assets -->
${this.app.assetSystem?.getExportHTML() || ''}
            <!-- Reusable mixins -->
${this.app.mixinSystem?.getExportHTML() || ''}
            <!-- Preload assets -->
            <a-asset-item id="xbot-model" src="assets/Xbot.glb"></a-asset-item>
            <a-asset-item id="ybot-model" src="assets/Ybot.glb"></a-asset-item>
            <a-asset-item id="tree1-model" src="assets/tree1.glb"></a-asset-item>
            <a-asset-item id="tree2-model" src="assets/tree2.glb"></a-asset-item>
            <a-asset-item id="table-model" src="assets/table.glb"></a-asset-item>
            <a-asset-item id="engine-model" src="assets/engine.glb"></a-asset-item>
            <audio id="blip1" src="assets/blip1.wav" preload="auto"></audio>
            <audio id="blip2" src="assets/blip2.wav" preload="auto"></audio>
        </a-assets>
        
        <!-- Scene Entities -->
${entitiesHTML}
        
        <!-- Default Camera -->
        <a-entity id="camera-rig" position="0 1.6 5">
            <a-camera look-controls wasd-controls>
                <a-cursor color="#00d9ff" fuse="false"></a-cursor>
            </a-camera>
        </a-entity>
        
        <!-- Default Lighting -->
        <a-light type="ambient" color="#ffffff" intensity="0.6"></a-light>
        <a-light type="directional" color="#ffffff" intensity="1.2" position="10 10 5"></a-light>
    </a-scene>
</body>
</html>`;
    }

    // Restore objects to their folders after loading
    restoreObjectsToFolders() {
        if (!this.app.layerManager) return;

        const saved = localStorage.getItem('pixelAFrame-folders');
        if (!saved) return;

        try {
            const folderData = JSON.parse(saved);

            // Create a map of object IDs to actual objects
            const objectMap = {};
            this.app.getAllObjects().forEach(obj => {
                const objId = obj.id || Math.random().toString(36).substr(2, 9);
                objectMap[objId] = obj;
            });

            // Restore objects to their folders
            folderData.forEach(folder => {
                const existingFolder = this.app.layerManager.folders.find(f => f.id === folder.id);
                if (existingFolder) {
                    folder.objects.forEach(objId => {
                        const obj = objectMap[objId];
                        if (obj) {
                            // Remove from main objects array if it exists there
                            const idx = this.app.objects.indexOf(obj);
                            if (idx > -1) {
                                this.app.objects.splice(idx, 1);
                            }
                            // Add to folder
                            existingFolder.objects.push(obj);
                        }
                    });
                }
            });

            // Refresh the UI
            if (this.app.layerManager) {
                this.app.layerManager.render();
            }
        } catch (err) {
            console.error("Failed to restore objects to folders:", err);
        }
    }
}