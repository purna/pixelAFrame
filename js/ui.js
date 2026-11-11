import { getEntityDoc, getComponentDoc, formatExampleHTML } from './aframeDocs.js';

export class UI {
    constructor(app) {
        this.app = app;
        this.propsContent = document.getElementById('props-content');
        this.layersList = document.getElementById('layers-list');
        this.canvasContainer = document.getElementById('canvas-container');

        // Modal Elements
        this.modal = document.getElementById('ai-modal');
        this.promptInput = document.getElementById('ai-prompt-input');
        this.btnGenerate = document.getElementById('btn-ai-generate');
        this.btnCancel = document.getElementById('btn-ai-cancel');
        this.spinner = document.getElementById('ai-spinner');
        this.modalTitle = document.getElementById('modal-title-text');
        this.modalDesc = document.getElementById('modal-desc');

        // Settings Modal (using unified settings modal)
        this.settingsModal = document.getElementById('unified-settings-modal');
        this.settingsInitialized = false;

        // Scene Settings Modal
        this.sceneSettingsModal = document.getElementById('scene-settings-modal');
        this.sceneSettingsInitialized = false;

        this.currentAIMode = 'scene';
    }

    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.activeSubmenu = null; // Track currently open submenu
        this.setupPanelTabs();
        this.setupRightTabs();

        // Submenus are positioned in viewport coordinates, so close them when
        // the toolbar or viewport moves.
        window.addEventListener('resize', () => this.closeAllSubmenus());
        document.getElementById('tools-container')?.addEventListener('scroll', () => this.closeAllSubmenus());
    }

    setupEventListeners() {
        // Toolbar Clicks
        document.getElementById('tools-container').addEventListener('click', (e) => {
            const actionBtn = e.target.closest('.tool-btn[data-action]');
            const clickedInsideSubmenu = e.target.closest('.tool-submenu');

            // Ignore clicks on submenu headings/padding so they don't close or
            // re-toggle the menu by accident.
            if (clickedInsideSubmenu && !actionBtn) return;

            const btn = actionBtn || e.target.closest('.tool-btn');
            if (!btn) return;

            // Handle Settings
            if (btn.id === 'tool-settings') {
                this.openSettingsModal();
                return;
            }

            // Handle AI Tool specifically
            if (btn.id === 'tool-ai-scene') {
                this.openAIModal('scene');
                return;
            }

            // Handle menu parent buttons - toggle submenu
            if (btn.classList.contains('menu-parent')) {
                this.toggleSubmenu(btn);
                return;
            }

            // Show panel if hidden when clicking action buttons
            const panel = document.getElementById('right-panel');
            if (panel && panel.classList.contains('hidden') && btn.dataset.action) {
                this.togglePropertiesPanel();
            }

            if (!btn.dataset.action) return;

            // Close any open submenus when performing an action
            this.closeAllSubmenus();

            // Make sure the properties/layers view is visible so the newly
            // added or selected item is actually shown to the user.
            const materialsSection = document.getElementById('materials-section');
            const sceneSection = document.getElementById('scene-section');
            if ((materialsSection && materialsSection.style.display !== 'none') ||
                (sceneSection && sceneSection.style.display !== 'none')) {
                this.resetPanelToDefault();
            }

            // Remove active class from all tools
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            // Add to clicked
            btn.classList.add('active');

            const action = btn.dataset.action;
            const type = btn.dataset.type;
            if (this.app[action]) {
                this.app[action](type);
            }
        });

        // Undo/Redo buttons
        document.getElementById('undoBtn').addEventListener('click', () => {
            if (this.app.undo) this.app.undo();
        });
        document.getElementById('redoBtn').addEventListener('click', () => {
            if (this.app.redo) this.app.redo();
        });

        // Main action buttons
        document.getElementById('btn-clear').addEventListener('click', () => {
            if (this.app.clearScene) this.app.clearScene();
        });
        document.getElementById('btn-save').addEventListener('click', () => {
            if (this.app.fileManager) {
                this.app.fileManager.saveToBrowser();
                this.showNotification('Scene saved to browser!', 'success');
            }
        });
        document.getElementById('btn-export-json')?.addEventListener('click', () => {
            if (this.app.fileManager) {
                this.app.fileManager.saveScene();
                this.showNotification('Scene exported as JSON!', 'success');
            }
        });
        document.getElementById('btn-export').addEventListener('click', () => this.openExportModal());

        // Project menu
        const projectMenu = document.getElementById('btn-project-menu');
        const projectMenuList = document.getElementById('project-menu-list');
        if (projectMenu && projectMenuList) {
            projectMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                projectMenuList.parentElement.classList.toggle('open');
            });
            projectMenuList.querySelectorAll('button').forEach(button => {
                button.addEventListener('click', () => {
                    projectMenuList.parentElement.classList.remove('open');
                });
            });
            document.addEventListener('click', (e) => {
                if (!projectMenuList.parentElement.contains(e.target)) {
                    projectMenuList.parentElement.classList.remove('open');
                }
            });
        }

        // Export modal
        document.getElementById('btn-export-cancel')?.addEventListener('click', () => this.closeExportModal());
        document.getElementById('export-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'export-modal') this.closeExportModal();
        });
        document.querySelectorAll('.export-option').forEach(option => {
            option.addEventListener('click', () => this.handleExportOption(option.dataset.export));
        });
        document.getElementById('btn-load').addEventListener('click', () => {
            document.getElementById('file-input').click();
        });
        document.getElementById('btn-load-browser').addEventListener('click', () => {
            if (this.app.fileManager) {
                const loaded = this.app.fileManager.loadFromBrowser();
                if (!loaded) {
                    this.showNotification('No saved scene found in browser', 'info');
                }
            }
        });

        document.getElementById('file-input').addEventListener('change', (e) => {
            if (this.app.fileManager && e.target.files[0])
                this.app.fileManager.loadScene(e);
        });
        // Panel toggle button
        const panelToggle = document.getElementById('panel-toggle');
        if (panelToggle) {
            panelToggle.addEventListener('click', () => this.togglePropertiesPanel());
        }

        // Mode buttons
        document.getElementById('mode-hand').addEventListener('click', () => {
            if (this.app.setTransformMode) this.app.setTransformMode('hand');
            console.log('Hand mode clicked');
        });
        document.getElementById('mode-translate').addEventListener('click', () => {
            if (this.app.setTransformMode) this.app.setTransformMode('translate');
            console.log('Translate mode clicked');
        });
        document.getElementById('mode-rotate').addEventListener('click', () => {
            if (this.app.setTransformMode) this.app.setTransformMode('rotate');
            console.log('Rotate mode clicked');
        });
        document.getElementById('mode-scale').addEventListener('click', () => {
            if (this.app.setTransformMode) this.app.setTransformMode('scale');
            console.log('Scale mode clicked');
        });

        // Zoom controls
        document.getElementById('zoom-in').addEventListener('click', () => {
            this.zoomCamera(1.2); // Zoom in
        });

        document.getElementById('zoom-out').addEventListener('click', () => {
            this.zoomCamera(0.8); // Zoom out
        });

        document.getElementById('zoom-slider').addEventListener('input', (e) => {
            const zoomLevel = parseFloat(e.target.value);
            this.setCameraZoom(zoomLevel);
        });

        // AI modal buttons
        this.btnGenerate.addEventListener('click', () => this.handleAIGenerate());
        this.btnCancel.addEventListener('click', () => this.closeAIModal());

        // AI modal close on overlay click
        document.getElementById('ai-modal').addEventListener('click', (e) => {
            if (e.target.id === 'ai-modal') this.closeAIModal();
        });

        // Close submenus when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.tools-panel')) {
                this.closeAllSubmenus();
            }
        });

        // A-Frame entity selection updates the properties panel. In A-Frame mode
        // this is the primary selection mechanism, so it must always render.
        window.addEventListener('aframe-entity-selected', (e) => {
            this.renderAFramePropertiesPanel(e.detail?.entity);
        });
        window.addEventListener('aframe-entity-deselected', () => {
            this.renderAFramePropertiesPanel(null);
        });
        window.addEventListener('aframe-entity-updated', (e) => {
            this.renderAFramePropertiesPanel(e.detail?.entity);
        });

        // Materials toolbar button
        document.getElementById('tool-materials')?.addEventListener('click', () => {
            // Show panel if hidden when clicking materials button
            const panel = document.getElementById('right-panel');
            if (panel && panel.classList.contains('hidden')) {
                this.togglePropertiesPanel();
            }
            this.toggleMaterialsView();
        });

        // Assets toolbar button
        document.getElementById('tool-assets')?.addEventListener('click', () => {
            const panel = document.getElementById('right-panel');
            if (panel && panel.classList.contains('hidden')) {
                this.togglePropertiesPanel();
            }
            this.toggleAssetsView();
        });

        // Scene settings toolbar button - now opens scene panel in right menu
        document.getElementById('tool-scene-settings')?.addEventListener('click', () => {
            // Show panel if hidden when clicking scene settings button
            const panel = document.getElementById('right-panel');
            if (panel && panel.classList.contains('hidden')) {
                this.togglePropertiesPanel();
            }
            this.toggleSceneView();
        });

        // Settings toolbar button - now opens unified settings
        document.getElementById('tool-settings')?.addEventListener('click', () => {
            this.openUnifiedSettingsModal('general');
        });

        // Overlay toggle toolbar button
        document.getElementById('tool-toggle-overlays')?.addEventListener('click', () => {
            this.toggleAllOverlays();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            // Handle undo/redo shortcuts first
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
                switch (e.key.toLowerCase()) {
                    case 'z':
                        e.preventDefault();
                        if (this.app.undo) this.app.undo();
                        return;
                    case 'y':
                        e.preventDefault();
                        if (this.app.redo) this.app.redo();
                        return;
                }
            }

            // Handle overlay toggle shortcut (Ctrl+Shift+O)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
                switch (e.key.toLowerCase()) {
                    case 'o':
                        e.preventDefault();
                        this.toggleAllOverlays();
                        return;
                    case 'l':
                        e.preventDefault();
                        if (this.app.fileManager) {
                            const loaded = this.app.fileManager.loadFromBrowser();
                            if (!loaded) {
                                this.showNotification('No saved scene found in browser', 'info');
                            }
                        }
                        return;
                }
            }

            const key = e.key.toLowerCase();
            switch (key) {
                case 'q':
                    document.getElementById('tool-select').click();
                    break;
                case 'g':
                    document.getElementById('mode-translate').click();
                    console.log('G key pressed - translate mode');
                    break;
                case 'r':
                    document.getElementById('mode-rotate').click();
                    console.log('R key pressed - rotate mode');
                    break;
                case 'h':
                    document.getElementById('mode-hand').click();
                    console.log('H key pressed - hand mode');
                    break;
                case 's':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        if (this.app.fileManager) {
                            this.app.fileManager.saveToBrowser();
                            this.showNotification('Scene saved to browser!', 'success');
                        }
                    } else {
                        document.getElementById('mode-scale').click();
                        console.log('S key pressed - scale mode');
                    }
                    break;
                case 'c':
                    if (this.app.clearScene) this.app.clearScene();
                    break;
                case 'o':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        document.getElementById('btn-load').click();
                    }
                    break;
                case 'x':
                    if (this.app.selectedObject && this.app.deleteSelected) {
                        this.app.deleteSelected();
                        this.showNotification('Object deleted!', 'success');
                    } else {
                        this.showNotification('No object selected to delete', 'info');
                    }
                    break;
            }
        });
    }

    // --- SETTINGS MODAL ---
    openSettingsModal() {
        // Redirect to unified settings modal
        this.openUnifiedSettingsModal('general');
    }

    closeSettingsModal() {
        if (this.settingsModal) {
            this.settingsModal.classList.remove('open');
        }
    }

    // Toggle all overlays (grid, axes, helpers)
    toggleAllOverlays() {
        // Get current state of grid visibility
        let gridVisible = false;
        let axesVisible = false;

        this.app.scene.traverse(obj => {
            if (obj.type === 'GridHelper') gridVisible = obj.visible;
            if (obj.type === 'AxesHelper') axesVisible = obj.visible;
        });

        // Determine if we should show or hide all overlays
        const shouldShow = !gridVisible || !axesVisible;

        // Toggle grid
        if (this.app.setGridVisible) this.app.setGridVisible(shouldShow);

        // Toggle axes
        if (this.app.setAxesVisible) this.app.setAxesVisible(shouldShow);

        // Toggle other helpers (light helpers, etc.)
        this.app.scene.traverse(obj => {
            if (obj.type === 'LightHelper' || obj.type === 'CameraHelper' ||
                obj.type === 'DirectionalLightHelper' || obj.type === 'PointLightHelper' ||
                obj.type === 'SpotLightHelper' || obj.type === 'HemisphereLightHelper' ||
                obj.type.includes('LightHelper')) {
                obj.visible = shouldShow;
            }
        });

        // Update button active state
        const overlayBtn = document.getElementById('tool-toggle-overlays');
        if (overlayBtn) {
            if (shouldShow) {
                overlayBtn.classList.add('active');
                overlayBtn.querySelector('i').className = 'fas fa-eye';
            } else {
                overlayBtn.classList.remove('active');
                overlayBtn.querySelector('i').className = 'fas fa-eye-slash';
            }
        }

        // Show notification
        const action = shouldShow ? 'shown' : 'hidden';
        this.showNotification(`All overlays ${action}`, 'success');
    }

    // --- SCENE SETTINGS MODAL ---
    openSceneSettingsModal() {
        if (!this.sceneSettingsInitialized) {
            this.initSceneSettingsModal();
            this.sceneSettingsInitialized = true;
        }
        this.loadSceneSettingsToUI();
        this.sceneSettingsModal.classList.add('open');
    }

    closeSceneSettingsModal() {
        this.sceneSettingsModal.classList.remove('open');
    }

    initSceneSettingsModal() {
        // Initialize scene settings modal
        this.sceneSettingsModal = document.getElementById('scene-settings-modal');

        // Close button
        const closeBtn = document.getElementById('btn-scene-settings-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeSceneSettingsModal());
        }

        // Reset button
        const resetBtn = document.getElementById('btn-scene-settings-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetSceneSettings();
            });
        }

        // Apply button
        const applyBtn = document.getElementById('btn-scene-settings-apply');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.applySceneSettings();
                this.closeSceneSettingsModal();
            });
        }

        // Resolution dropdown change handler
        const resolutionDropdown = document.getElementById('setting-export-resolution');
        if (resolutionDropdown) {
            resolutionDropdown.addEventListener('change', (e) => {
                const customGroup = document.getElementById('custom-resolution-group');
                if (e.target.value === 'custom') {
                    customGroup.style.display = 'block';
                } else {
                    customGroup.style.display = 'none';
                }
            });
        }

        // Close on overlay click
        this.sceneSettingsModal.addEventListener('click', (e) => {
            if (e.target.id === 'scene-settings-modal') this.closeSceneSettingsModal();
        });
    }

    resetSceneSettings() {
        const defaults = {
            backgroundEnabled: true,
            backgroundColor: '#1a1a2e',
            backgroundGradient: false,
            backgroundTop: '#1a1a2e',
            backgroundBottom: '#0b1220',
            fogEnabled: false,
            fogColor: '#1a1a2e',
            fogNear: 30,
            fogFar: 100,
            fogMatchBackground: false,
            ambientLight: true,
            ambientColor: '#ffffff',
            ambientIntensity: 1,
            skyColor: '#1a1a2e',
            skyImage: '',
            shadowEnabled: false,
            shadowType: 'pcfsoft',
            exportTransparent: false,
            exportResolution: '1920x1080',
            customWidth: 1920,
            customHeight: 1080
        };

        const set = (id, value, prop = 'value') => {
            const el = document.getElementById(id);
            if (el) {
                if (prop === 'checked') el.checked = !!value;
                else el.value = value;
            }
        };

        set('setting-background-enabled', defaults.backgroundEnabled, 'checked');
        set('setting-background-color', defaults.backgroundColor);
        set('setting-background-gradient', defaults.backgroundGradient, 'checked');
        set('setting-background-top', defaults.backgroundTop);
        set('setting-background-bottom', defaults.backgroundBottom);
        set('setting-fog-enabled', defaults.fogEnabled, 'checked');
        set('setting-fog-color', defaults.fogColor);
        set('setting-fog-near', defaults.fogNear);
        set('setting-fog-far', defaults.fogFar);
        set('setting-fog-match-background', defaults.fogMatchBackground, 'checked');
        set('setting-ambient-light', defaults.ambientLight, 'checked');
        set('setting-ambient-color', defaults.ambientColor);
        set('setting-ambient-intensity', defaults.ambientIntensity);
        set('setting-sky-color', defaults.skyColor);
        set('setting-sky-image', defaults.skyImage);
        set('setting-shadow-enabled', defaults.shadowEnabled, 'checked');
        set('setting-shadow-type', defaults.shadowType);
        set('setting-export-transparent', defaults.exportTransparent, 'checked');
        set('setting-export-resolution', defaults.exportResolution);
        set('setting-custom-width', defaults.customWidth);
        set('setting-custom-height', defaults.customHeight);

        this.updateSettingsRangeLabels();
        const customGroup = document.getElementById('custom-resolution-group');
        if (customGroup) customGroup.style.display = 'none';
        this.showNotification('Scene settings reset to defaults!', 'success');
    }

    updateSettingsRangeLabels() {
        const pairs = [
            ['setting-autosave-interval', 'autosave-interval-value'],
            ['setting-camera-speed', 'camera-speed-value'],
            ['setting-fog-near', 'fog-near-value'],
            ['setting-fog-far', 'fog-far-value'],
            ['setting-ambient-intensity', 'ambient-intensity-value']
        ];
        pairs.forEach(([inputId, labelId]) => {
            const input = document.getElementById(inputId);
            const label = document.getElementById(labelId);
            if (input && label) label.textContent = input.value;
        });
    }

    loadSceneSettingsToUI() {
        const saved = localStorage.getItem('pixel3d-scene-settings');
        const defaults = {
            backgroundEnabled: true,
            backgroundColor: '#1a1a2e',
            backgroundGradient: false,
            backgroundTop: '#1a1a2e',
            backgroundBottom: '#0b1220',
            fogEnabled: false,
            fogColor: '#1a1a2e',
            fogNear: 30,
            fogFar: 100,
            fogMatchBackground: false,
            ambientLight: true,
            ambientColor: '#ffffff',
            ambientIntensity: 1,
            skyColor: '#1a1a2e',
            skyImage: '',
            shadowEnabled: false,
            shadowType: 'pcfsoft',
            exportTransparent: false,
            exportResolution: '1920x1080',
            customWidth: 1920,
            customHeight: 1080
        };
        const settings = saved ? { ...defaults, ...JSON.parse(saved) } : defaults;

        const set = (id, value, prop = 'value') => {
            const el = document.getElementById(id);
            if (!el) return;
            if (prop === 'checked') el.checked = !!value;
            else el.value = value;
        };

        set('setting-background-enabled', settings.backgroundEnabled, 'checked');
        set('setting-background-color', settings.backgroundColor);
        set('setting-background-gradient', settings.backgroundGradient, 'checked');
        set('setting-background-top', settings.backgroundTop);
        set('setting-background-bottom', settings.backgroundBottom);
        set('setting-fog-enabled', settings.fogEnabled, 'checked');
        set('setting-fog-color', settings.fogColor);
        set('setting-fog-near', settings.fogNear);
        set('setting-fog-far', settings.fogFar);
        set('setting-fog-match-background', settings.fogMatchBackground, 'checked');
        set('setting-ambient-light', settings.ambientLight, 'checked');
        set('setting-ambient-color', settings.ambientColor);
        set('setting-ambient-intensity', settings.ambientIntensity);
        set('setting-sky-color', settings.skyColor);
        set('setting-sky-image', settings.skyImage);
        set('setting-shadow-enabled', settings.shadowEnabled, 'checked');
        set('setting-shadow-type', settings.shadowType);
        set('setting-export-transparent', settings.exportTransparent, 'checked');
        set('setting-export-resolution', settings.exportResolution);
        set('setting-custom-width', settings.customWidth);
        set('setting-custom-height', settings.customHeight);

        this.updateSettingsRangeLabels();
        const customGroup = document.getElementById('custom-resolution-group');
        if (customGroup) {
            customGroup.style.display = settings.exportResolution === 'custom' ? 'block' : 'none';
        }
    }

    applySceneSettings() {
        const settings = {
            backgroundEnabled: document.getElementById('setting-background-enabled')?.checked ?? true,
            backgroundColor: document.getElementById('setting-background-color')?.value || '#1a1a2e',
            backgroundGradient: document.getElementById('setting-background-gradient')?.checked ?? false,
            backgroundTop: document.getElementById('setting-background-top')?.value || '#1a1a2e',
            backgroundBottom: document.getElementById('setting-background-bottom')?.value || '#0b1220',
            fogEnabled: document.getElementById('setting-fog-enabled')?.checked ?? false,
            fogColor: document.getElementById('setting-fog-color')?.value || '#1a1a2e',
            fogNear: Number(document.getElementById('setting-fog-near')?.value || 30),
            fogFar: Number(document.getElementById('setting-fog-far')?.value || 100),
            fogMatchBackground: document.getElementById('setting-fog-match-background')?.checked ?? false,
            ambientLight: document.getElementById('setting-ambient-light')?.checked ?? true,
            ambientColor: document.getElementById('setting-ambient-color')?.value || '#ffffff',
            ambientIntensity: Number(document.getElementById('setting-ambient-intensity')?.value || 1),
            skyColor: document.getElementById('setting-sky-color')?.value || '#1a1a2e',
            skyImage: document.getElementById('setting-sky-image')?.value || '',
            shadowEnabled: document.getElementById('setting-shadow-enabled')?.checked ?? false,
            shadowType: document.getElementById('setting-shadow-type')?.value || 'pcfsoft',
            exportTransparent: document.getElementById('setting-export-transparent')?.checked ?? false,
            exportResolution: document.getElementById('setting-export-resolution')?.value || '1920x1080',
            customWidth: parseInt(document.getElementById('setting-custom-width')?.value || 1920),
            customHeight: parseInt(document.getElementById('setting-custom-height')?.value || 1080)
        };

        if (settings.fogMatchBackground) settings.fogColor = settings.backgroundColor;
        localStorage.setItem('pixel3d-scene-settings', JSON.stringify(settings));

        // Three.js settings
        if (this.app.setBackgroundColor) {
            this.app.setBackgroundColor(settings.backgroundEnabled ? settings.backgroundColor : null);
        }
        if (this.app.setAmbientLight) {
            this.app.setAmbientLight(settings.ambientLight, settings.ambientColor);
        }

        // A-Frame settings
        const scene = document.getElementById('aframe-scene');
        const globals = this.app.globalsSystem;
        if (globals) {
            if (settings.backgroundEnabled) {
                globals.set('background', { color: settings.backgroundColor });
            } else {
                globals.remove('background');
            }
            if (settings.fogEnabled) {
                globals.set('fog', {
                    type: 'linear',
                    color: settings.fogColor,
                    near: settings.fogNear,
                    far: settings.fogFar
                });
            } else {
                globals.remove('fog');
            }
            globals.setShadows(settings.shadowEnabled, settings.shadowType);
        }

        const ambient = scene?.querySelector('a-light[type="ambient"]') || scene?.querySelector('a-light');
        if (ambient) {
            ambient.setAttribute('visible', settings.ambientLight);
            ambient.setAttribute('color', settings.ambientColor);
            ambient.setAttribute('intensity', settings.ambientIntensity);
        }

        let sky = scene?.querySelector('a-sky');
        if (!sky) sky = this.app.aframeManager?.addEntity('a-sky', { color: settings.skyColor });
        if (sky) {
            sky.setAttribute('color', settings.skyColor);
            if (settings.skyImage) sky.setAttribute('src', settings.skyImage);
            else sky.removeAttribute('src');
        }

        window.exportSettings = {
            transparent: settings.exportTransparent,
            resolution: settings.exportResolution,
            customWidth: settings.customWidth,
            customHeight: settings.customHeight
        };

        this.showNotification('Scene settings applied successfully!', 'success');
    }

    setupRightTabs() {
        document.querySelectorAll('.right-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchRightTab(tab.dataset.rightTab);
            });
        });
    }

    switchRightTab(tabId) {
        if (!tabId) return;

        document.querySelectorAll('.right-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.rightTab === tabId);
        });
        document.querySelectorAll('.right-tab-content').forEach(content => {
            content.classList.toggle('active', content.id === 'tab-' + tabId);
        });

        // Keep the inner section visible when returning to a tab after another
        // view has hidden it.
        if (tabId === 'hierarchy') {
            const layers = document.getElementById('layers-list');
            if (layers) layers.style.display = 'block';
        } else if (tabId === 'properties') {
            const props = document.getElementById('props-content');
            if (props) props.style.display = 'block';
        } else if (tabId === 'assets') {
            const assets = document.getElementById('assets-section');
            if (assets) assets.style.display = 'flex';
            this.renderAssetsSection();
        } else if (tabId === 'scene') {
            const scene = document.getElementById('scene-section');
            if (scene) scene.style.display = 'block';
            this.renderSceneSettingsPanel();
        }
    }

    toggleMaterialsView() {
        this.assetTab = 'materials';
        this.switchRightTab('assets');
    }

    toggleAssetsView() {
        this.switchRightTab('assets');
    }

    toggleSceneView() {
        this.switchRightTab('scene');
    }

    resetPanelToDefault() {
        this.switchRightTab('hierarchy');
    }

    renderAssetsSection() {
        const container = document.getElementById('assets-content');
        const assetSystem = this.app.assetSystem;
        if (!container) return;
        if (!assetSystem) {
            container.innerHTML = '<div class="empty-state">Asset system is not available.</div>';
            return;
        }

        this.assetTab = this.assetTab || 'all';
        this.assetSearch = this.assetSearch || '';
        container.innerHTML = '';

        const tabs = [
            { id: 'all', label: 'All', icon: 'fa-layer-group', types: ['image', 'panorama', 'video', 'audio', 'model'] },
            { id: 'components', label: 'Components', icon: 'fa-puzzle-piece', types: [] },
            { id: 'materials', label: 'Materials', icon: 'fa-palette', types: [] },
            { id: 'textures', label: 'Textures', icon: 'fa-th', types: ['image', 'panorama'] },
            { id: 'colors', label: 'Colors', icon: 'fa-tint', types: [] },
            { id: 'images', label: 'Images', icon: 'fa-image', types: ['image', 'panorama'] },
            { id: 'media', label: 'Media', icon: 'fa-video', types: ['video'] },
            { id: 'audio', label: 'Audio', icon: 'fa-volume-up', types: ['audio'] },
            { id: 'models', label: 'Models', icon: 'fa-cubes', types: ['model'] },
            { id: 'mixins', label: 'Mixins', icon: 'fa-clone', types: [] }
        ];

        const tabBar = document.createElement('div');
        tabBar.className = 'assets-tabs';
        tabs.forEach(tab => {
            const button = document.createElement('button');
            button.className = 'asset-tab' + (this.assetTab === tab.id ? ' active' : '');
            button.innerHTML = `<i class="fas ${tab.icon}"></i> ${tab.label}`;
            button.addEventListener('click', () => {
                this.assetTab = tab.id;
                this.renderAssetsSection();
            });
            tabBar.appendChild(button);
        });
        container.appendChild(tabBar);

        const searchWrap = document.createElement('div');
        searchWrap.className = 'asset-search';
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search assets...';
        searchInput.value = this.assetSearch;
        searchWrap.appendChild(searchInput);
        container.appendChild(searchWrap);

        const listContainer = document.createElement('div');
        listContainer.className = 'assets-list';
        let renderList = () => {};

        const makeRow = (preview, name, meta, actions) => {
            const row = document.createElement('div');
            row.className = 'material-item';
            row.style.alignItems = 'center';
            const info = document.createElement('div');
            info.className = 'material-info';
            info.innerHTML = `<div style="font-size:0.75rem;color:var(--text-primary);font-weight:bold;">${name}</div><div style="font-size:0.65rem;color:var(--text-secondary);">${meta}</div>`;
            const actionWrap = document.createElement('div');
            actionWrap.className = 'material-actions';
            actions.forEach(action => actionWrap.appendChild(action));
            row.appendChild(preview);
            row.appendChild(info);
            row.appendChild(actionWrap);
            return row;
        };

        const iconButton = (icon, title, onClick) => {
            const button = document.createElement('button');
            button.className = 'btn icon-only';
            button.title = title;
            button.innerHTML = `<i class="fas ${icon}"></i>`;
            button.addEventListener('click', onClick);
            return button;
        };

        if (!['materials', 'mixins', 'components', 'colors'].includes(this.assetTab)) {
            const currentTab = tabs.find(tab => tab.id === this.assetTab) || tabs[0];
            const tabLabel = currentTab.id === 'all' ? 'Assets' : currentTab.label;
            const form = document.createElement('div');
            form.className = 'property-group asset-add-form';
            const options = currentTab.id === 'all'
                ? '<option value="image">Image</option><option value="panorama">360 Panorama</option><option value="video">Video</option><option value="audio">Audio</option><option value="model">3D Model</option>'
                : currentTab.id === 'images' ? '<option value="image">Image</option><option value="panorama">360 Panorama</option>'
                : currentTab.id === 'media' ? '<option value="video">Video</option>'
                : currentTab.id === 'audio' ? '<option value="audio">Audio</option>'
                : '<option value="model">3D Model (.glb / .gltf)</option>';
            const addLabel = currentTab.id === 'textures' ? 'Add Texture' : `Add ${tabLabel}`;
            form.innerHTML = `
                <div class="property-label">${addLabel}</div>
                <div class="input-group"><span>Name</span><input type="text" class="asset-name" placeholder="My asset"></div>
                <div class="input-group"><span>Type</span><select class="component-select asset-type">${options}</select></div>
                <div class="input-group"><span>URL</span><input type="text" class="asset-url" placeholder="https://..."></div>
                <input type="file" class="asset-file" style="display:none">
                <button class="btn asset-file-btn" style="width:100%;margin-top:5px;"><i class="fas fa-folder-open"></i> Choose File</button>
                <button class="btn primary asset-add-btn" style="width:100%;margin-top:5px;"><i class="fas fa-plus"></i> Add Asset</button>
            `;
            const fileInput = form.querySelector('.asset-file');
            fileInput.accept = currentTab.id === 'audio' ? 'audio/*' : currentTab.id === 'media' ? 'video/*' : currentTab.id === 'models' ? '.glb,.gltf' : currentTab.id === 'all' ? '' : 'image/*';
            const optionMarkup = currentTab.id === 'textures'
                ? '<option value="image">Image Texture</option><option value="panorama">360 Texture</option>'
                : options;
            form.querySelector('.asset-type').innerHTML = optionMarkup;
            form.querySelector('.asset-file-btn').addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', () => {
                const file = fileInput.files && fileInput.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                    form.querySelector('.asset-url').value = reader.result;
                    if (!form.querySelector('.asset-name').value) form.querySelector('.asset-name').value = file.name;
                };
                reader.readAsDataURL(file);
            });
            form.querySelector('.asset-add-btn').addEventListener('click', () => {
                const src = form.querySelector('.asset-url').value.trim();
                if (!src) {
                    this.showNotification('Enter an asset URL or choose a file first.', 'error');
                    return;
                }
                assetSystem.addAsset({
                    name: form.querySelector('.asset-name').value.trim(),
                    type: form.querySelector('.asset-type').value,
                    src
                });
                this.renderAssetsSection();
            });
            container.appendChild(form);
            container.appendChild(listContainer);

            renderList = () => {
                listContainer.innerHTML = '';
                const query = this.assetSearch.toLowerCase();
                const assets = assetSystem.getAssets().filter(asset => {
                    if (!currentTab.types.includes(asset.type)) return false;
                    return !query || `${asset.name} ${asset.type} ${asset.id}`.toLowerCase().includes(query);
                });
                if (!assets.length) {
                    listContainer.innerHTML = `<div class="empty-state"><p>No ${tabLabel.toLowerCase()} yet.</p><p>Add a URL or choose a file above.</p></div>`;
                    return;
                }
                assets.forEach(asset => {
                    const preview = document.createElement('div');
                    preview.className = 'material-preview';
                    if (asset.type === 'image' || asset.type === 'panorama') {
                        preview.style.backgroundImage = `url("${asset.src}")`;
                        preview.style.backgroundSize = 'cover';
                        preview.style.backgroundPosition = 'center';
                    } else {
                        const icons = { video: 'fa-video', audio: 'fa-volume-up', model: 'fa-cubes' };
                        preview.innerHTML = `<i class="fas ${icons[asset.type] || 'fa-file'}" style="display:flex;align-items:center;justify-content:center;height:100%;"></i>`;
                    }
                    listContainer.appendChild(makeRow(
                        preview,
                        asset.name,
                        `${asset.type} · #${asset.id}`,
                        [
                            iconButton('fa-plus', 'Place in scene', () => assetSystem.addAssetToScene(asset.id)),
                            iconButton('fa-check', 'Use on selected element', () => {
                                if (!assetSystem.applyAssetToSelected(asset.id)) this.showNotification('Select an A-Frame element first.', 'info');
                            }),
                            iconButton('fa-trash', 'Delete asset', () => {
                                if (!window.confirm(`Delete asset "${asset.name}"?`)) return;
                                assetSystem.removeAsset(asset.id);
                                this.renderAssetsSection();
                            })
                        ]
                    ));
                });
            };
        } else if (this.assetTab === 'components') {
            const componentSystem = this.app.componentSystem;
            container.appendChild(listContainer);
            renderList = () => {
                listContainer.innerHTML = '';
                const query = this.assetSearch.toLowerCase();
                const components = (componentSystem?.getAvailableComponents?.() || []).filter(component =>
                    !query || `${component.label} ${component.name} ${component.category}`.toLowerCase().includes(query)
                );
                if (!components.length) {
                    listContainer.innerHTML = '<div class="empty-state">No components found.</div>';
                    return;
                }
                components.forEach(component => {
                    const preview = document.createElement('div');
                    preview.className = 'material-preview';
                    preview.innerHTML = '<i class="fas fa-puzzle-piece" style="display:flex;align-items:center;justify-content:center;height:100%;"></i>';
                    listContainer.appendChild(makeRow(
                        preview,
                        component.label,
                        `${component.category} · ${component.name}`,
                        [iconButton('fa-plus', 'Add to selected element', () => {
                            const selected = this.app.aframeManager?.getSelectedEntity?.();
                            if (!selected) {
                                this.showNotification('Select an A-Frame element first.', 'info');
                                return;
                            }
                            componentSystem.addComponent(selected, component.name);
                            this.renderAFramePropertiesPanel(selected);
                        })]
                    ));
                });
            };
        } else if (this.assetTab === 'colors') {
            const getColorAssets = () => {
                try { return JSON.parse(localStorage.getItem('pixelAFrame-color-assets') || '[]'); }
                catch (err) { return []; }
            };
            const saveColorAssets = (colors) => localStorage.setItem('pixelAFrame-color-assets', JSON.stringify(colors));

            const form = document.createElement('div');
            form.className = 'property-group asset-add-form';
            form.innerHTML = `
                <div class="property-label">Add Color</div>
                <div class="input-group"><span>Name</span><input type="text" class="color-name" placeholder="Sky blue"></div>
                <div class="input-group"><span>Color</span><input type="color" class="color-value" value="#4CC3D9"></div>
                <button class="btn primary" style="width:100%;margin-top:5px;"><i class="fas fa-plus"></i> Add Color</button>
            `;
            form.querySelector('button').addEventListener('click', () => {
                const colors = getColorAssets();
                colors.push({
                    name: form.querySelector('.color-name').value.trim() || 'Color',
                    color: form.querySelector('.color-value').value
                });
                saveColorAssets(colors);
                this.renderAssetsSection();
            });
            container.appendChild(form);
            container.appendChild(listContainer);

            renderList = () => {
                listContainer.innerHTML = '';
                const query = this.assetSearch.toLowerCase();
                const colors = getColorAssets().filter(color => !query || color.name.toLowerCase().includes(query));
                if (!colors.length) {
                    listContainer.innerHTML = '<div class="empty-state"><p>No color assets yet.</p><p>Add a named color above.</p></div>';
                    return;
                }
                colors.forEach((color, index) => {
                    const preview = document.createElement('div');
                    preview.className = 'material-preview';
                    preview.style.backgroundColor = color.color;
                    listContainer.appendChild(makeRow(
                        preview,
                        color.name,
                        color.color,
                        [iconButton('fa-check', 'Apply to selected element', () => {
                            const selected = this.app.aframeManager?.getSelectedEntity?.();
                            if (!selected) {
                                this.showNotification('Select an A-Frame element first.', 'info');
                                return;
                            }
                            selected.setAttribute('material', 'color', color.color);
                        }), iconButton('fa-trash', 'Delete color', () => {
                            const colors = getColorAssets();
                            colors.splice(index, 1);
                            saveColorAssets(colors);
                            this.renderAssetsSection();
                        })]
                    ));
                });
            };
        } else if (this.assetTab === 'mixins') {
            const mixinSystem = this.app.mixinSystem;
            const form = document.createElement('div');
            form.className = 'property-group asset-add-form';
            form.innerHTML = '<div class="property-label">Mixins</div><button class="btn primary" style="width:100%;"><i class="fas fa-clone"></i> Create Mixin from Selected Element</button>';
            form.querySelector('button').addEventListener('click', () => {
                const selected = this.app.aframeManager?.getSelectedEntity?.();
                if (!selected) {
                    this.showNotification('Select an A-Frame element first.', 'info');
                    return;
                }
                const name = window.prompt('Mixin name:', selected.id ? selected.id + ' Mixin' : 'New Mixin');
                if (!name) return;
                mixinSystem?.createFromElement(selected, name);
                this.renderAssetsSection();
            });
            container.appendChild(form);
            container.appendChild(listContainer);
            renderList = () => {
                listContainer.innerHTML = '';
                const query = this.assetSearch.toLowerCase();
                const mixins = (mixinSystem?.getMixins() || []).filter(mixin => !query || `${mixin.name} ${mixin.id}`.toLowerCase().includes(query));
                if (!mixins.length) {
                    listContainer.innerHTML = '<div class="empty-state"><p>No mixins yet.</p><p>Save a selected element as a reusable mixin.</p></div>';
                    return;
                }
                mixins.forEach(mixin => {
                    const preview = document.createElement('div');
                    preview.className = 'material-preview';
                    preview.innerHTML = '<i class="fas fa-clone" style="display:flex;align-items:center;justify-content:center;height:100%;"></i>';
                    const components = Object.keys(mixin.components || {});
                    listContainer.appendChild(makeRow(
                        preview,
                        mixin.name,
                        `${components.length ? components.join(', ') : 'No components'} · #${mixin.id}`,
                        [
                            iconButton('fa-check', 'Apply to selected element', () => {
                                const selected = this.app.aframeManager?.getSelectedEntity?.();
                                if (!selected) {
                                    this.showNotification('Select an A-Frame element first.', 'info');
                                    return;
                                }
                                mixinSystem.applyToElement(selected, mixin.id);
                                this.renderAFramePropertiesPanel(selected);
                            }),
                            iconButton('fa-trash', 'Delete mixin', () => {
                                if (!window.confirm(`Delete mixin "${mixin.name}"?`)) return;
                                mixinSystem.deleteMixin(mixin.id);
                                this.renderAssetsSection();
                            })
                        ]
                    ));
                });
            };
        } else {
            const materialsManager = this.app.materialsManager;
            const form = document.createElement('div');
            form.className = 'property-group asset-add-form';
            form.innerHTML = '<div class="property-label">Materials</div><button class="btn primary" style="width:100%;"><i class="fas fa-plus"></i> Create Material</button>';
            form.querySelector('button').addEventListener('click', () => materialsManager?.createNewMaterial());
            container.appendChild(form);
            container.appendChild(listContainer);
            renderList = () => {
                listContainer.innerHTML = '';
                const query = this.assetSearch.toLowerCase();
                const materials = (materialsManager?.materials || []).filter(material => !query || `${material.name} ${material.id}`.toLowerCase().includes(query));
                if (!materials.length) {
                    listContainer.innerHTML = '<div class="empty-state">No materials yet. Create one to reuse it across elements.</div>';
                    return;
                }
                materials.forEach(material => {
                    const preview = document.createElement('div');
                    preview.className = 'material-preview';
                    preview.style.backgroundColor = '#' + material.color.toString(16).padStart(6, '0');
                    listContainer.appendChild(makeRow(
                        preview,
                        material.name,
                        `M: ${material.metalness.toFixed(2)} · R: ${material.roughness.toFixed(2)}`,
                        [
                            iconButton('fa-check', 'Apply to selected element', () => materialsManager?.applyMaterialToSelected(material)),
                            iconButton('fa-edit', 'Edit material', () => materialsManager?.editMaterial(material))
                        ]
                    ));
                });
            };
        }

        searchInput.addEventListener('input', () => {
            this.assetSearch = searchInput.value;
            renderList();
        });
        renderList();
    }

    setupPanelTabs() {
        // Add event listeners for panel tabs
        document.querySelectorAll('.panel-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;

                // Remove active class from all tabs and content
                document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.panel-tab-content').forEach(content => content.classList.remove('active'));

                // Add active class to clicked tab and corresponding content
                tab.classList.add('active');
                document.querySelector(`.panel-tab-content[data-tab-content="${tabId}"]`).classList.add('active');

                // Update layer manager if switching to scene objects tab
                if (tabId === 'scene-objects' && this.app.layerManager) {
                    this.app.layerManager.render();
                }
            });
        });
    }

    initSettingsModal() {
        // This method is now handled by initUnifiedSettingsModal()
        // Redirect to the unified settings initialization
        if (!this.unifiedSettingsInitialized) {
            this.initUnifiedSettingsModal();
            this.unifiedSettingsInitialized = true;
        }
    }

    toggleSubmenu(btn) {
        const submenu = btn.querySelector('.tool-submenu');
        if (!submenu) return;

        // Clicking the open menu again closes it. Clicking a different menu
        // closes the previous one and opens the new one.
        const wasOpen = submenu.classList.contains('open');
        this.closeAllSubmenus();
        if (wasOpen) return;

        // Show it first so the real height can be measured.
        submenu.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');

        const margin = 8;
        const header = document.querySelector('header');
        const minTop = Math.max(margin, (header?.getBoundingClientRect().bottom || 0) + 8);
        const availableHeight = Math.max(120, window.innerHeight - minTop - margin);

        submenu.style.maxHeight = `${availableHeight}px`;

        const btnRect = btn.getBoundingClientRect();
        const menuHeight = Math.min(submenu.scrollHeight, availableHeight);

        // Keep the menu inside the viewport and below the header, scrolling
        // internally when it is taller than the available space.
        let top = btnRect.top + btnRect.height / 2 - 24;
        top = Math.max(minTop, Math.min(top, window.innerHeight - menuHeight - margin));

        const arrowTop = Math.max(
            8,
            Math.min(btnRect.top + btnRect.height / 2 - top - 8, menuHeight - 24)
        );

        submenu.style.top = `${top}px`;
        submenu.style.setProperty('--submenu-top', `${top}px`);
        submenu.style.setProperty('--submenu-arrow-top', `${arrowTop}px`);

        this.activeSubmenu = submenu;
    }
    handleSubmenuClick(e) {
        e.stopPropagation(); // Prevent event bubbling to toolbar handler
        const btn = e.currentTarget;

        // Show panel if hidden
        const panel = document.getElementById('right-panel');
        if (panel && panel.classList.contains('hidden')) {
            this.togglePropertiesPanel();
        }

        // Close submenu
        this.closeAllSubmenus();

        // Make sure the properties/layers view is visible
        this.resetPanelToDefault();

        // Remove active class from all tools
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        // Add to clicked
        btn.classList.add('active');

        const action = btn.dataset.action;
        const type = btn.dataset.type;
        if (this.app[action]) {
            this.app[action](type);
        }
    }

    closeAllSubmenus() {
        document.querySelectorAll('.tool-submenu').forEach(menu => {
            menu.classList.remove('open');
            const parent = menu.closest('.menu-parent');
            if (parent) parent.setAttribute('aria-expanded', 'false');
        });
        this.activeSubmenu = null;
    }

    togglePropertiesPanel() {
        const panel = document.getElementById('right-panel');
        const toggle = document.getElementById('panel-toggle');
        const workspace = document.querySelector('.workspace');

        if (!panel) return;

        const icon = toggle ? toggle.querySelector('i') : null;

        if (panel.classList.contains('hidden')) {
            // Show panel
            panel.classList.remove('hidden');
            if (toggle) toggle.classList.remove('panel-hidden');
            if (workspace) workspace.classList.remove('panel-hidden');
            if (icon) icon.className = 'fas fa-chevron-right';
            if (toggle) toggle.title = 'Hide Panel';

            // Reset to default view when showing panel
            this.resetPanelToDefault();
        } else {
            // Hide panel
            panel.classList.add('hidden');
            if (toggle) toggle.classList.add('panel-hidden');
            if (workspace) workspace.classList.add('panel-hidden');
            if (icon) icon.className = 'fas fa-chevron-left';
            if (toggle) toggle.title = 'Show Panel';
        }

        // Trigger resize to update 3D renderer
        setTimeout(() => {
            if (this.app.onWindowResize) {
                this.app.onWindowResize();
            }
        }, 300); // Wait for CSS transition to complete
    }

    loadSettings() {
        const saved = localStorage.getItem('pixel3d-settings');
        if (saved) {
            const settings = JSON.parse(saved);
            // Apply settings to app
            if (this.app.setGridVisible) this.app.setGridVisible(settings.grid);
            if (this.app.setAxesVisible) this.app.setAxesVisible(settings.axes);
            if (this.app.setSnapEnabled) this.app.setSnapEnabled(settings.snap);
            if (this.app.setCameraSpeed) this.app.setCameraSpeed(settings.cameraSpeed);
            // Apply tooltips
            window.tooltipsEnabled = settings.tooltips !== false;
            // Apply autosave
            if (this.app.fileManager && this.app.fileManager.setAutosaveEnabled) {
                this.app.fileManager.setAutosaveEnabled(settings.autosave !== false);
                if (this.app.fileManager.setAutosaveInterval) {
                    this.app.fileManager.setAutosaveInterval(settings.autosaveInterval || 5);
                }
            }
        }
    }

    loadSettingsToUI() {
        const saved = localStorage.getItem('pixel3d-settings');
        if (saved) {
            const settings = JSON.parse(saved);
            // Set UI values
            const gridEl = document.getElementById('setting-grid');
            const axesEl = document.getElementById('setting-axes');
            const snapEl = document.getElementById('setting-snap');
            const tooltipsEl = document.getElementById('setting-tooltips');
            const speedEl = document.getElementById('setting-camera-speed');
            const speedValueEl = document.getElementById('camera-speed-value');
            const autosaveEl = document.getElementById('setting-autosave');
            const autosaveIntervalEl = document.getElementById('setting-autosave-interval');
            const autosaveIntervalValueEl = document.getElementById('autosave-interval-value');
    
            if (gridEl) gridEl.checked = settings.grid !== false;
            if (axesEl) axesEl.checked = settings.axes !== false;
            if (snapEl) snapEl.checked = settings.snap !== false;
            if (tooltipsEl) tooltipsEl.checked = settings.tooltips !== false;
            if (speedEl) {
                speedEl.value = settings.cameraSpeed || 1;
                if (speedValueEl) speedValueEl.textContent = settings.cameraSpeed || 1;
            }
            if (autosaveEl) autosaveEl.checked = settings.autosave !== false;
            if (autosaveIntervalEl) {
                autosaveIntervalEl.value = settings.autosaveInterval || 5;
                if (autosaveIntervalValueEl) autosaveIntervalValueEl.textContent = settings.autosaveInterval || 5;
            }
        }
    }


    saveSettings() {
        const settings = {
            grid: document.getElementById('setting-grid').checked,
            axes: document.getElementById('setting-axes').checked,
            snap: document.getElementById('setting-snap').checked,
            tooltips: document.getElementById('setting-tooltips').checked,
            cameraSpeed: parseFloat(document.getElementById('setting-camera-speed').value),
            autosave: document.getElementById('setting-autosave').checked,
            autosaveInterval: parseInt(document.getElementById('setting-autosave-interval').value)
        };

        // Save
        localStorage.setItem('pixel3d-settings', JSON.stringify(settings));

        // Apply
        if (this.app.setGridVisible) this.app.setGridVisible(settings.grid);
        if (this.app.setAxesVisible) this.app.setAxesVisible(settings.axes);
        if (this.app.setSnapEnabled) this.app.setSnapEnabled(settings.snap);
        if (this.app.setCameraSpeed) this.app.setCameraSpeed(settings.cameraSpeed);

        // Tooltip global variable update
        window.tooltipsEnabled = settings.tooltips;

        this.showNotification('Settings saved successfully!', 'success');
    }

    resetSettings() {
        // Use config defaults
        const defaults = {
            grid: true,
            axes: true,
            snap: true,
            tooltips: true,
            cameraSpeed: 1,
            autosave: false,
            autosaveInterval: 5
        };

        // If config is available, use its defaults
        if (typeof APP_DEFAULTS !== 'undefined') {
            defaults.grid = APP_DEFAULTS.ui.gridVisible;
            defaults.axes = APP_DEFAULTS.ui.axesVisible;
            defaults.snap = APP_DEFAULTS.ui.snapEnabled;
            defaults.tooltips = APP_DEFAULTS.ui.tooltipsEnabled;
            defaults.cameraSpeed = APP_DEFAULTS.ui.cameraSpeed;
            defaults.autosave = APP_DEFAULTS.ui.autosaveEnabled;
            defaults.autosaveInterval = APP_DEFAULTS.ui.autosaveInterval;
        }

        // Save reset
        localStorage.setItem('pixel3d-settings', JSON.stringify(defaults));

        // Apply immediately
        if (this.app.setGridVisible) this.app.setGridVisible(true);
        if (this.app.setAxesVisible) this.app.setAxesVisible(true);
        if (this.app.setSnapEnabled) this.app.setSnapEnabled(true);
        if (this.app.setCameraSpeed) this.app.setCameraSpeed(1);

        window.tooltipsEnabled = true;
        // Apply autosave
        if (this.app.fileManager && this.app.fileManager.setAutosaveEnabled) {
            this.app.fileManager.setAutosaveEnabled(false);
            if (this.app.fileManager.setAutosaveInterval) {
                this.app.fileManager.setAutosaveInterval(5);
            }
        }

        // Update UI elements visually
        this.loadSettingsToUI();

        this.showNotification('Settings reset to defaults!', 'success');
    }

    // --- AI MODAL LOGIC ---
    openExportModal() {
        const modal = document.getElementById('export-modal');
        if (modal) modal.classList.add('open');
    }

    closeExportModal() {
        const modal = document.getElementById('export-modal');
        if (modal) modal.classList.remove('open');
    }

    handleExportOption(option) {
        this.closeExportModal();
        const fileManager = this.app.fileManager;
        if (!fileManager) return;

        if (option === 'html') {
            fileManager.exportHTMLFile();
        } else if (option === 'zip') {
            fileManager.exportAsAFrameHTML();
        } else if (option === 'json') {
            fileManager.saveScene();
            this.showNotification('Project JSON exported!', 'success');
        }
    }

    openAIModal(mode) {
        this.currentAIMode = mode;
        this.promptInput.value = '';
        this.modal.classList.add('open');
        this.promptInput.focus();

        if (mode === 'scene') {
            this.modalTitle.textContent = "Magic Scene Generator";
            this.modalDesc.textContent = "Describe a full scene layout.";
            this.promptInput.placeholder = "e.g. A futuristic city with tall blue cylinders and neon cones...";
        } else {
            this.modalTitle.textContent = "Material Assistant";
            this.modalDesc.textContent = "Describe the material or mood for the color.";
            this.promptInput.placeholder = "e.g. Molten lava, Rusty metal, Cyberpunk pink...";
        }
    }

    closeAIModal() {
        this.modal.classList.remove('open');
        this.spinner.classList.remove('active');
        this.btnGenerate.disabled = false;
        this.btnCancel.disabled = false;
    }

    async handleAIGenerate() {
        const text = this.promptInput.value.trim();
        if (!text) return;

        this.spinner.classList.add('active');
        this.btnGenerate.disabled = true;
        this.btnCancel.disabled = true;

        try {
            if (this.currentAIMode === 'scene') {
                const sceneData = await this.app.gemini.generateScene(text);
                // Use FileManager to load the data structure
                this.app.fileManager.loadData(sceneData);
                this.showNotification('Scene generated by AI!', 'success');
            } else if (this.currentAIMode === 'material') {
                const colorHex = await this.app.gemini.generateMaterialColor(text);
                if (this.app.selectedObject) {
                    this.app.applyColorToSelected(colorHex);
                    this.showNotification('Material color applied!', 'success');
                }
            }
            this.closeAIModal();
        } catch (err) {
            console.error(err);
            this.showNotification('AI Generation failed. See console for details.', 'error');
            this.spinner.classList.remove('active');
            this.btnGenerate.disabled = false;
            this.btnCancel.disabled = false;
        }
    }

    // --- PROPERTIES PANEL ---
    updateUI(selectedObject) {
        if (selectedObject) {
            const panel = document.getElementById('right-panel');
            if (panel && panel.classList.contains('hidden')) {
                this.togglePropertiesPanel();
            }
            this.switchRightTab('properties');
        }

        // Delegate Layer List Rendering to LayerManager
        if (this.app.layerManager) {
            this.app.layerManager.render();
        }

        // Always render the properties panel first to create the inputs
        this.renderPropertiesPanel(selectedObject);

        if (!selectedObject) {
            return;
        }

        // Now update the input values (inputs exist after renderPropertiesPanel)
        const pos = selectedObject.position;
        const rot = selectedObject.rotation;
        const scale = selectedObject.scale;

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el && document.activeElement !== el) el.value = val.toFixed(2);
        };

        setVal('pos-x', pos.x);
        setVal('pos-y', pos.y);
        setVal('pos-z', pos.z);

        setVal('rot-x', rot.x);
        setVal('rot-y', rot.y);
        setVal('rot-z', rot.z);

        setVal('scl-x', scale.x);
        setVal('scl-y', scale.y);
        setVal('scl-z', scale.z);
    }

    // --- A-FRAME PROPERTIES PANEL ---
    renderAFramePropertiesPanel(entity) {
        if (this.app.aframeManager && !this.app.aframeManager.isAFrameMode) return;

        const sceneSection = document.getElementById('scene-section');
        const materialsSection = document.getElementById('materials-section');
        const assetsSection = document.getElementById('assets-section');
        const propsContent = document.getElementById('props-content');
        const layersList = document.getElementById('layers-list');

        if (!propsContent) return;

        if (sceneSection) sceneSection.style.display = 'none';
        if (materialsSection) materialsSection.style.display = 'none';
        if (assetsSection) assetsSection.style.display = 'none';
        propsContent.style.display = 'block';
        if (layersList) layersList.style.display = 'block';
        document.querySelectorAll('.panel-header').forEach(header => {
            header.style.display = 'flex';
        });

        const panel = document.getElementById('right-panel');
        if (panel && panel.classList.contains('hidden')) {
            this.togglePropertiesPanel();
        }

        this.switchRightTab('properties');
        this.propsContent.innerHTML = '';

        if (!entity) {
            this.renderAFrameSceneSettings();
            return;
        }

        const parseVec = (value, fallback) => {
            if (value && typeof value === 'object') {
                return {
                    x: Number(value.x) || 0,
                    y: Number(value.y) || 0,
                    z: Number(value.z) || 0
                };
            }
            const parts = String(value || fallback).trim().split(/\s+/).map(Number);
            return {
                x: Number.isFinite(parts[0]) ? parts[0] : fallback[0],
                y: Number.isFinite(parts[1]) ? parts[1] : fallback[1],
                z: Number.isFinite(parts[2]) ? parts[2] : fallback[2]
            };
        };

        const toColorValue = (value, fallback = '#4CC3D9') => {
            if (value && typeof value === 'object' && value.getHexString) {
                return '#' + value.getHexString();
            }
            if (typeof value === 'string' && /^#[0-9a-f]{3,8}$/i.test(value)) {
                return value;
            }
            return fallback;
        };

        const header = document.createElement('div');
        header.className = 'property-group';
        header.innerHTML = `<div style="font-weight:bold; color:var(--accent-primary); border-bottom:1px solid #333; padding-bottom:5px;">${entity.id || entity.tagName.toLowerCase()}</div><div style="font-size:0.7rem; color:var(--text-secondary); margin-top:4px;">${entity.tagName.toLowerCase()}</div>`;
        this.propsContent.appendChild(header);

        const idGroup = document.createElement('div');
        idGroup.className = 'property-group';
        idGroup.innerHTML = `<div class="property-label">Element ID</div><input type="text" class="component-select" value="${entity.id || ''}" placeholder="e.g. welcome-box">`;
        idGroup.querySelector('input').addEventListener('change', (e) => {
            const newId = e.target.value.trim();
            if (newId) entity.id = newId;
        });
        this.propsContent.appendChild(idGroup);

        // Short, student-friendly documentation for the selected element.
        const entityDoc = getEntityDoc(entity.tagName.toLowerCase());
        const entityDocGroup = document.createElement('details');
        entityDocGroup.className = 'doc-block';
        const entityDocSummary = document.createElement('summary');
        entityDocSummary.textContent = `About <${entity.tagName.toLowerCase()}>`;
        const entityDocText = document.createElement('p');
        entityDocText.textContent = entityDoc.description;
        const entityExample = document.createElement('pre');
        entityExample.className = 'doc-example';
        const entityExampleCode = document.createElement('code');
        entityExampleCode.textContent = formatExampleHTML(entityDoc.example);
        entityExample.appendChild(entityExampleCode);
        entityDocGroup.appendChild(entityDocSummary);
        entityDocGroup.appendChild(entityDocText);
        entityDocGroup.appendChild(entityExample);
        this.propsContent.appendChild(entityDocGroup);

        const addVec3 = (label, attribute, fallback) => {
            const vec = parseVec(entity.getAttribute(attribute), fallback);
            const group = document.createElement('div');
            group.className = 'property-group';
            group.innerHTML = `<div class="property-label">${label}</div>`;
            const row = document.createElement('div');
            row.className = 'input-row';

            ['x', 'y', 'z'].forEach(axis => {
                const inputGroup = document.createElement('div');
                inputGroup.className = 'input-group';
                inputGroup.innerHTML = `<span>${axis.toUpperCase()}</span><input type="number" step="0.1" value="${vec[axis]}">`;
                const input = inputGroup.querySelector('input');
                input.addEventListener('change', () => {
                    vec[axis] = Number(input.value) || 0;
                    entity.setAttribute(attribute, `${vec.x} ${vec.y} ${vec.z}`);
                });
                row.appendChild(inputGroup);
            });

            group.appendChild(row);
            this.propsContent.appendChild(group);
        };

        addVec3('Position', 'position', [0, 1, -3]);
        addVec3('Rotation', 'rotation', [0, 0, 0]);
        addVec3('Scale', 'scale', [1, 1, 1]);

        // Visible toggle
        const visibleGroup = document.createElement('div');
        visibleGroup.className = 'property-group';
        visibleGroup.innerHTML = `<label style="display:flex; align-items:center; gap:8px; font-size:0.8rem;"><input type="checkbox" ${entity.getAttribute('visible') !== false ? 'checked' : ''}> Visible</label>`;
        visibleGroup.querySelector('input').addEventListener('change', (e) => {
            entity.setAttribute('visible', e.target.checked);
        });
        this.propsContent.appendChild(visibleGroup);

        // Material controls
        const materialAttr = entity.getAttribute('material') || {};
        const materialGroup = document.createElement('div');
        materialGroup.className = 'property-group';
        materialGroup.innerHTML = `<div class="property-label">Material</div>`;

        const colorRow = document.createElement('div');
        colorRow.className = 'input-group';
        colorRow.innerHTML = `<span>Color</span><input type="color" value="${toColorValue(materialAttr.color || entity.getAttribute('color'))}">`;
        colorRow.querySelector('input').addEventListener('input', (e) => {
            entity.setAttribute('material', 'color', e.target.value);
        });
        materialGroup.appendChild(colorRow);

        ['metalness', 'roughness'].forEach(prop => {
            const row = document.createElement('div');
            row.className = 'input-group';
            row.innerHTML = `<span>${prop[0].toUpperCase() + prop.slice(1)}</span><input type="number" min="0" max="1" step="0.05" value="${Number(materialAttr[prop] ?? 0.5)}">`;
            row.querySelector('input').addEventListener('change', (e) => {
                entity.setAttribute('material', prop, Number(e.target.value));
            });
            materialGroup.appendChild(row);
        });

        this.propsContent.appendChild(materialGroup);

        // Text value (a-text)
        if (entity.tagName.toLowerCase() === 'a-text') {
            const textGroup = document.createElement('div');
            textGroup.className = 'property-group';
            textGroup.innerHTML = `<div class="property-label">Text</div><input type="text" style="width:100%;" value="${entity.getAttribute('value') || ''}">`;
            textGroup.querySelector('input').addEventListener('change', (e) => {
                entity.setAttribute('value', e.target.value);
            });
            this.propsContent.appendChild(textGroup);
        }

        const tag = entity.tagName.toLowerCase();
        const mediaTags = ['a-image', 'a-video', 'a-sky', 'a-videosphere', 'a-sound', 'a-gltf-model'];

        // Media source (image, video, panorama, audio, model)
        if (mediaTags.includes(tag)) {
            const mediaGroup = document.createElement('div');
            mediaGroup.className = 'property-group';
            mediaGroup.innerHTML = `<div class="property-label">Media</div>`;

            const srcRow = document.createElement('div');
            srcRow.className = 'input-group';
            const srcLabel = document.createElement('span');
            srcLabel.textContent = 'Source';
            const srcInput = document.createElement('input');
            srcInput.type = 'text';
            srcInput.placeholder = 'https://... or choose a file';
            srcInput.value = entity.getAttribute('src') || '';
            srcInput.addEventListener('change', () => {
                entity.setAttribute('src', srcInput.value.trim());
            });
            srcRow.appendChild(srcLabel);
            srcRow.appendChild(srcInput);
            mediaGroup.appendChild(srcRow);

            const fileRow = document.createElement('div');
            fileRow.style.marginTop = '6px';
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.style.display = 'none';
            fileInput.accept = tag === 'a-sound' ? 'audio/*' :
                (tag === 'a-video' || tag === 'a-videosphere') ? 'video/*' :
                tag === 'a-gltf-model' ? '.glb,.gltf' : 'image/*';
            fileInput.addEventListener('change', () => {
                const file = fileInput.files && fileInput.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                    entity.setAttribute('src', reader.result);
                    srcInput.value = file.name;
                };
                reader.readAsDataURL(file);
            });
            const chooseBtn = document.createElement('button');
            chooseBtn.className = 'btn';
            chooseBtn.style.width = '100%';
            chooseBtn.innerHTML = '<i class="fas fa-folder-open"></i> Choose File';
            chooseBtn.addEventListener('click', () => fileInput.click());
            fileRow.appendChild(fileInput);
            fileRow.appendChild(chooseBtn);
            mediaGroup.appendChild(fileRow);

            this.propsContent.appendChild(mediaGroup);

            if (tag === 'a-sound') {
                const soundGroup = document.createElement('div');
                soundGroup.className = 'property-group';
                soundGroup.innerHTML = `
                    <div class="property-label">Audio</div>
                    <label style="display:flex; align-items:center; gap:8px; font-size:0.8rem;"><input type="checkbox" class="sound-autoplay" ${entity.getAttribute('autoplay') === true ? 'checked' : ''}> Autoplay</label>
                    <label style="display:flex; align-items:center; gap:8px; font-size:0.8rem;"><input type="checkbox" class="sound-loop" ${entity.getAttribute('loop') === true ? 'checked' : ''}> Loop</label>
                    <div class="input-group"><span>Volume</span><input type="number" class="sound-volume" min="0" max="1" step="0.05" value="${Number(entity.getAttribute('volume') ?? 1)}"></div>
                `;
                soundGroup.querySelector('.sound-autoplay').addEventListener('change', (e) => entity.setAttribute('autoplay', e.target.checked));
                soundGroup.querySelector('.sound-loop').addEventListener('change', (e) => entity.setAttribute('loop', e.target.checked));
                soundGroup.querySelector('.sound-volume').addEventListener('change', (e) => entity.setAttribute('volume', Number(e.target.value)));
                this.propsContent.appendChild(soundGroup);
            }
        }

        // Particle effect controls
        const particleAttr = entity.getAttribute('studio-particles');
        if (particleAttr) {
            const particleGroup = document.createElement('div');
            particleGroup.className = 'property-group';
            particleGroup.innerHTML = `<div class="property-label">Particle Effect</div>`;

            ['count', 'size', 'speed', 'spread', 'height', 'opacity'].forEach(prop => {
                const row = document.createElement('div');
                row.className = 'input-group';
                row.innerHTML = `<span>${prop[0].toUpperCase() + prop.slice(1)}</span><input type="number" step="0.05" value="${Number(particleAttr[prop] ?? 0)}">`;
                row.querySelector('input').addEventListener('change', (e) => {
                    entity.setAttribute('studio-particles', prop, Number(e.target.value));
                });
                particleGroup.appendChild(row);
            });

            const colorRow = document.createElement('div');
            colorRow.className = 'input-group';
            colorRow.innerHTML = `<span>Color</span><input type="color" value="${toColorValue(particleAttr.color, '#7dd3fc')}">`;
            colorRow.querySelector('input').addEventListener('input', (e) => {
                entity.setAttribute('studio-particles', 'color', e.target.value);
            });
            particleGroup.appendChild(colorRow);

            this.propsContent.appendChild(particleGroup);
        }

        // Curated, Dreamweaver-style behaviours
        this.renderAFrameBehaviorSection(entity);

        // Component and mixin authoring systems
        this.renderAFrameComponentSection(entity);
        this.renderAFrameMixinSection(entity);

        // Advanced custom actions
        const behaviorAttr = entity.getAttribute('studio-behavior');
        let allBehaviors = [];
        if (behaviorAttr) {
            try {
                const rawActions = typeof behaviorAttr === 'object' ? behaviorAttr.actions : behaviorAttr;
                allBehaviors = JSON.parse(rawActions || '[]');
                if (!Array.isArray(allBehaviors)) allBehaviors = [];
            } catch (err) {
                allBehaviors = [];
            }
        }
        // Curated behaviours own some actions internally; only show manual
        // actions here so the advanced editor does not delete them.
        const behaviors = allBehaviors.filter(action => !action._behaviorId);

        const behaviorGroup = document.createElement('div');
        behaviorGroup.className = 'property-group';
        behaviorGroup.innerHTML = `<div class="property-label">Behaviours / Triggers</div>`;

        if (behaviors.length === 0) {
            const empty = document.createElement('div');
            empty.style.cssText = 'font-size:0.72rem; color:var(--text-secondary); margin-bottom:6px;';
            empty.textContent = 'No actions yet. Add an action to make this element interactive.';
            behaviorGroup.appendChild(empty);
        }

        behaviors.forEach((action, index) => {
            const row = document.createElement('div');
            row.style.cssText = 'display:flex; align-items:center; gap:6px; background:var(--bg-light); border:1px solid var(--border-color); border-radius:4px; padding:5px 6px; margin-bottom:4px; font-size:0.7rem;';
            const text = document.createElement('span');
            text.style.flex = '1';
            text.textContent = `${action.trigger || 'click'} → ${action.type}${action.value ? ': ' + action.value : ''}`;
            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn icon-only';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.title = 'Remove action';
            removeBtn.addEventListener('click', () => {
                const targetIndex = allBehaviors.indexOf(action);
                if (targetIndex > -1) allBehaviors.splice(targetIndex, 1);
                entity.setAttribute('studio-behavior', 'actions', JSON.stringify(allBehaviors));
                this.renderAFramePropertiesPanel(entity);
            });
            row.appendChild(text);
            row.appendChild(removeBtn);
            behaviorGroup.appendChild(row);
        });

        const triggerSelect = document.createElement('select');
        triggerSelect.className = 'component-select';
        [['click', 'On click'], ['mouseenter', 'On hover'], ['mouseleave', 'On hover out']].forEach(([value, label]) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            triggerSelect.appendChild(option);
        });
        behaviorGroup.appendChild(triggerSelect);

        const actionSelect = document.createElement('select');
        actionSelect.className = 'component-select';
        actionSelect.style.marginTop = '4px';
        [
            ['goto-url', 'Go to URL'],
            ['open-window', 'Open window'],
            ['popup-message', 'Popup message'],
            ['play-sound', 'Play audio'],
            ['stop-sound', 'Stop audio'],
            ['toggle-visibility', 'Toggle visibility'],
            ['show-element', 'Show element'],
            ['hide-element', 'Hide element'],
            ['swap-image', 'Swap image'],
            ['start-animation', 'Start animation'],
            ['stop-animation', 'Stop animation'],
            ['enter-vr', 'Enter VR'],
            ['enter-ar', 'Enter AR'],
            ['go-back', 'Go back']
        ].forEach(([value, label]) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            actionSelect.appendChild(option);
        });
        behaviorGroup.appendChild(actionSelect);

        const targetInput = document.createElement('input');
        targetInput.type = 'text';
        targetInput.className = 'component-select';
        targetInput.style.marginTop = '4px';
        targetInput.placeholder = 'Target selector (optional, e.g. #my-box)';
        behaviorGroup.appendChild(targetInput);

        const valueInput = document.createElement('input');
        valueInput.type = 'text';
        valueInput.className = 'component-select';
        valueInput.style.marginTop = '4px';
        valueInput.placeholder = 'URL, text, image URL or value';
        behaviorGroup.appendChild(valueInput);

        const addBehaviorBtn = document.createElement('button');
        addBehaviorBtn.className = 'btn primary';
        addBehaviorBtn.style.cssText = 'width:100%; margin-top:6px;';
        addBehaviorBtn.innerHTML = '<i class="fas fa-plus"></i> Add Action';
        addBehaviorBtn.addEventListener('click', () => {
            const action = {
                trigger: triggerSelect.value,
                type: actionSelect.value,
                target: targetInput.value.trim(),
                value: valueInput.value.trim()
            };
            if (!action.target) delete action.target;
            if (!action.value) delete action.value;
            allBehaviors.push(action);
            entity.setAttribute('studio-behavior', 'actions', JSON.stringify(allBehaviors));
            this.renderAFramePropertiesPanel(entity);
        });
        behaviorGroup.appendChild(addBehaviorBtn);

        this.propsContent.appendChild(behaviorGroup);

        // Delete selected entity
        const actions = document.createElement('div');
        actions.className = 'property-group';
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn';
        deleteBtn.style.width = '100%';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete Element';
        deleteBtn.addEventListener('click', () => {
            this.app.aframeManager?.removeEntity(entity);
            this.renderAFramePropertiesPanel(null);
        });
        actions.appendChild(deleteBtn);
        this.propsContent.appendChild(actions);
    }

    renderAFrameBehaviorSection(entity) {
        const system = this.app.behaviorSystem;
        if (!system) return;

        const group = document.createElement('div');
        group.className = 'property-group';
        group.innerHTML = '<div class="property-label">Behaviours</div>';

        const applied = system.getApplied(entity);
        if (applied.length === 0) {
            const empty = document.createElement('div');
            empty.style.cssText = 'font-size:0.72rem; color:var(--text-secondary); margin-bottom:6px;';
            empty.textContent = 'Click-to-add behaviours: show/hide, highlight, spin, doors, sounds and more.';
            group.appendChild(empty);
        }

        applied.forEach(record => {
            const definition = system.getDefinition(record.type);
            const row = document.createElement('div');
            row.style.cssText = 'display:flex; align-items:center; gap:6px; background:var(--bg-light); border:1px solid var(--border-color); border-radius:4px; padding:5px 6px; margin-bottom:4px; font-size:0.7rem;';

            const text = document.createElement('span');
            text.style.flex = '1';
            text.innerHTML = `<i class="fas ${definition?.icon || 'fa-magic'}"></i> ${definition?.label || record.type}`;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn icon-only';
            removeBtn.title = 'Remove behaviour';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.addEventListener('click', () => {
                system.remove(entity, record.id);
                this.renderAFramePropertiesPanel(entity);
            });

            row.appendChild(text);
            row.appendChild(removeBtn);
            group.appendChild(row);
        });

        // Ready-made presets for scaffolding.
        const presets = system.getPresets();
        const presetRow = document.createElement('div');
        presetRow.style.cssText = 'display:flex; gap:6px; margin-top:6px;';
        const presetSelect = document.createElement('select');
        presetSelect.className = 'component-select';
        presetSelect.innerHTML = '<option value="">Preset...</option>';
        Object.entries(presets).forEach(([name, preset]) => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = preset.label;
            option.title = preset.description;
            presetSelect.appendChild(option);
        });
        const presetBtn = document.createElement('button');
        presetBtn.className = 'btn';
        presetBtn.innerHTML = '<i class="fas fa-magic"></i>';
        presetBtn.title = 'Apply preset';
        presetBtn.addEventListener('click', () => {
            if (!presetSelect.value) return;
            system.applyPreset(entity, presetSelect.value);
            this.renderAFramePropertiesPanel(entity);
        });
        presetRow.appendChild(presetSelect);
        presetRow.appendChild(presetBtn);
        group.appendChild(presetRow);

        // Add a single behaviour with simple parameter fields.
        const library = system.getLibrary();
        const behaviorSelect = document.createElement('select');
        behaviorSelect.className = 'component-select';
        behaviorSelect.style.marginTop = '6px';
        behaviorSelect.innerHTML = '<option value="">Add behaviour...</option>';

        const categories = {};
        Object.entries(library).forEach(([name, definition]) => {
            if (!categories[definition.category]) categories[definition.category] = [];
            categories[definition.category].push({ name, definition });
        });
        Object.entries(categories).forEach(([category, items]) => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = category;
            items.forEach(({ name, definition }) => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = definition.label;
                option.title = definition.description;
                optgroup.appendChild(option);
            });
            behaviorSelect.appendChild(optgroup);
        });
        group.appendChild(behaviorSelect);

        const paramsContainer = document.createElement('div');
        paramsContainer.style.cssText = 'display:flex; flex-direction:column; gap:5px; margin-top:5px;';
        group.appendChild(paramsContainer);

        const collectParams = {};
        const rebuildParams = (type) => {
            paramsContainer.innerHTML = '';
            Object.keys(collectParams).forEach(key => delete collectParams[key]);
            const definition = library[type];
            if (!definition) return;

            Object.entries(definition.params || {}).forEach(([name, param]) => {
                const row = document.createElement('div');
                row.className = 'input-group';
                const label = document.createElement('span');
                label.textContent = param.label || name;
                row.appendChild(label);

                let input;
                if (param.type === 'entity') {
                    input = document.createElement('select');
                    input.className = 'component-select';
                    const selfOption = document.createElement('option');
                    selfOption.value = '';
                    selfOption.textContent = 'This element';
                    input.appendChild(selfOption);

                    const entities = this.app.aframeManager?.getAllEntities?.() || [];
                    entities.forEach(item => {
                        const element = item.element;
                        if (!element || !element.id) return;
                        const option = document.createElement('option');
                        option.value = '#' + element.id;
                        option.textContent = `#${element.id} (${element.tagName.toLowerCase()})`;
                        input.appendChild(option);
                    });
                    input.value = param.default || '';
                } else if (param.type === 'image-target') {
                    input = document.createElement('select');
                    input.className = 'component-select';
                    const selfOption = document.createElement('option');
                    selfOption.value = '';
                    selfOption.textContent = 'This element';
                    input.appendChild(selfOption);

                    const entities = this.app.aframeManager?.getAllEntities?.() || [];
                    entities
                        .filter(item => ['a-image', 'a-sky', 'a-video', 'a-videosphere'].includes(item.element?.tagName?.toLowerCase()))
                        .forEach(item => {
                            const element = item.element;
                            if (!element.id) return;
                            const option = document.createElement('option');
                            option.value = '#' + element.id;
                            option.textContent = `#${element.id} (${element.tagName.toLowerCase()})`;
                            input.appendChild(option);
                        });
                    input.value = param.default || '';
                } else if (param.type === 'image-asset') {
                    input = document.createElement('select');
                    input.className = 'component-select';
                    const emptyOption = document.createElement('option');
                    emptyOption.value = '';
                    emptyOption.textContent = 'Choose image asset...';
                    input.appendChild(emptyOption);

                    const assets = this.app.assetSystem?.getAssets?.() || [];
                    assets
                        .filter(asset => asset.type === 'image' || asset.type === 'panorama')
                        .forEach(asset => {
                            const option = document.createElement('option');
                            option.value = '#' + asset.id;
                            option.textContent = `${asset.name} (#${asset.id})`;
                            input.appendChild(option);
                        });
                    input.value = param.default || '';
                } else if (param.type === 'textarea') {
                    input = document.createElement('textarea');
                    input.className = 'component-select';
                    input.rows = 3;
                    input.value = param.default !== undefined ? param.default : '';
                } else if (param.type === 'boolean') {
                    input = document.createElement('input');
                    input.type = 'checkbox';
                    input.checked = param.default === true;
                } else if (param.type === 'select') {
                    input = document.createElement('select');
                    input.className = 'component-select';
                    (param.options || []).forEach(optionValue => {
                        const option = document.createElement('option');
                        option.value = optionValue;
                        option.textContent = optionValue;
                        input.appendChild(option);
                    });
                    input.value = param.default;
                } else {
                    input = document.createElement('input');
                    input.type = param.type === 'number' ? 'number'
                        : param.type === 'color' ? 'color' : 'text';
                    if (param.type === 'number') {
                        if (param.min !== undefined) input.min = param.min;
                        if (param.max !== undefined) input.max = param.max;
                        input.step = param.step || 0.1;
                    }
                    input.value = param.default !== undefined ? param.default : '';
                }

                const readValue = () => {
                    if (param.type === 'boolean') return input.checked;
                    if (param.type === 'number') return Number(input.value) || 0;
                    return input.value;
                };
                collectParams[name] = { input, param, readValue };
                input.addEventListener('input', () => {
                    collectParams[name].value = readValue();
                });
                collectParams[name].value = readValue();
                row.appendChild(input);
                paramsContainer.appendChild(row);
            });
        };

        behaviorSelect.addEventListener('change', () => rebuildParams(behaviorSelect.value));

        const addBtn = document.createElement('button');
        addBtn.className = 'btn primary';
        addBtn.style.cssText = 'width:100%; margin-top:6px;';
        addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Behaviour';
        addBtn.addEventListener('click', () => {
            const type = behaviorSelect.value;
            if (!type) return;
            const params = {};
            Object.entries(collectParams).forEach(([name, entry]) => {
                params[name] = entry.readValue();
            });
            system.add(entity, type, params);
            this.renderAFramePropertiesPanel(entity);
        });
        group.appendChild(addBtn);

        this.propsContent.appendChild(group);
    }

    renderAFrameComponentSection(entity) {
        const system = this.app.componentSystem;
        if (!system) return;

        const group = document.createElement('div');
        group.className = 'property-group';
        group.innerHTML = '<div class="property-label">Components</div>';

        const components = system.getComponents(entity);
        if (components.length === 0) {
            const empty = document.createElement('div');
            empty.style.cssText = 'font-size:0.72rem; color:var(--text-secondary); margin-bottom:6px;';
            empty.textContent = 'No optional components on this element yet.';
            group.appendChild(empty);
        }

        components.forEach(component => {
            const details = document.createElement('details');
            details.className = 'component-item';
            details.style.display = 'block';

            const summary = document.createElement('summary');
            summary.style.cssText = 'display:flex; align-items:center; gap:6px; cursor:pointer;';
            const label = document.createElement('span');
            label.className = 'component-name';
            label.textContent = component.label;
            const badge = document.createElement('span');
            badge.style.cssText = 'font-size:0.6rem; color:var(--text-secondary);';
            badge.textContent = component.name;
            const removeBtn = document.createElement('i');
            removeBtn.className = 'fas fa-times remove-component';
            removeBtn.title = 'Remove component';
            removeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                system.removeComponent(entity, component.name);
                this.renderAFramePropertiesPanel(entity);
            });
            summary.appendChild(label);
            summary.appendChild(badge);
            summary.appendChild(removeBtn);
            details.appendChild(summary);

            const body = document.createElement('div');
            body.style.cssText = 'display:flex; flex-direction:column; gap:5px; padding-top:6px;';

            const componentDoc = getComponentDoc(component.name);
            const componentDescription = document.createElement('p');
            componentDescription.className = 'doc-description';
            componentDescription.textContent = componentDoc.description;
            const componentExample = document.createElement('pre');
            componentExample.className = 'doc-example';
            const componentExampleCode = document.createElement('code');
            componentExampleCode.textContent = formatExampleHTML(componentDoc.example);
            componentExample.appendChild(componentExampleCode);
            body.appendChild(componentDescription);
            body.appendChild(componentExample);

            const schema = system.getSchema(component.name);

            if (Object.keys(schema).length === 0) {
                const textarea = document.createElement('textarea');
                textarea.className = 'component-select';
                textarea.rows = 3;
                textarea.value = system.serialize(entity, component.name);
                textarea.addEventListener('change', () => {
                    system.setRawData(entity, component.name, textarea.value);
                });
                body.appendChild(textarea);
            } else {
                Object.entries(schema).forEach(([property, definition]) => {
                    const current = component.data[property] ?? definition.default ?? '';
                    const row = document.createElement('div');
                    row.className = 'input-group';
                    const labelEl = document.createElement('span');
                    labelEl.textContent = property;
                    row.appendChild(labelEl);

                    let input;
                    if (current && typeof current === 'object') {
                        input = document.createElement('textarea');
                        input.className = 'component-select';
                        input.rows = 2;
                        input.value = JSON.stringify(current);
                        input.addEventListener('change', () => {
                            try {
                                system.setProperty(entity, component.name, property, JSON.parse(input.value));
                            } catch (err) {
                                this.showNotification('That value must be valid JSON.', 'error');
                            }
                        });
                    } else if (definition.type === 'boolean') {
                        input = document.createElement('input');
                        input.type = 'checkbox';
                        input.checked = current === true || current === 'true';
                        input.addEventListener('change', () => {
                            system.setProperty(entity, component.name, property, input.checked);
                        });
                    } else if (definition.type === 'select') {
                        input = document.createElement('select');
                        input.className = 'component-select';
                        (definition.options || []).forEach(optionValue => {
                            const option = document.createElement('option');
                            option.value = optionValue;
                            option.textContent = optionValue;
                            input.appendChild(option);
                        });
                        input.value = current;
                        input.addEventListener('change', () => {
                            system.setProperty(entity, component.name, property, input.value);
                        });
                    } else {
                        input = document.createElement('input');
                        input.type = definition.type === 'number' ? 'number'
                            : definition.type === 'color' ? 'color' : 'text';
                        if (definition.type === 'number') {
                            if (definition.min !== undefined) input.min = definition.min;
                            if (definition.max !== undefined) input.max = definition.max;
                            input.step = definition.step || 0.1;
                        }
                        input.value = current;
                        input.addEventListener('change', () => {
                            let value = input.value;
                            if (definition.type === 'number') value = Number(value) || 0;
                            system.setProperty(entity, component.name, property, value);
                        });
                    }

                    row.appendChild(input);
                    body.appendChild(row);
                });
            }

            details.appendChild(body);
            group.appendChild(details);
        });

        const currentNames = new Set(components.map(component => component.name));
        const addRow = document.createElement('div');
        addRow.style.cssText = 'display:flex; gap:6px; margin-top:6px;';
        const select = document.createElement('select');
        select.className = 'component-select';
        select.innerHTML = '<option value="">Add component...</option>';

        const grouped = {};
        system.getAvailableComponents()
            .filter(component => !currentNames.has(component.name))
            .forEach(component => {
                if (!grouped[component.category]) grouped[component.category] = [];
                grouped[component.category].push(component);
            });

        Object.entries(grouped).forEach(([category, items]) => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = category;
            items.forEach(item => {
                const option = document.createElement('option');
                option.value = item.name;
                option.textContent = item.label;
                optgroup.appendChild(option);
            });
            select.appendChild(optgroup);
        });

        const addBtn = document.createElement('button');
        addBtn.className = 'btn';
        addBtn.innerHTML = '<i class="fas fa-plus"></i>';
        addBtn.title = 'Add component';
        addBtn.addEventListener('click', () => {
            if (!select.value) return;
            system.addComponent(entity, select.value);
            this.renderAFramePropertiesPanel(entity);
        });

        addRow.appendChild(select);
        addRow.appendChild(addBtn);
        group.appendChild(addRow);
        this.propsContent.appendChild(group);
    }

    renderAFrameMixinSection(entity) {
        const system = this.app.mixinSystem;
        if (!system) return;

        const group = document.createElement('div');
        group.className = 'property-group';
        group.innerHTML = '<div class="property-label">Mixins</div>';

        const createBtn = document.createElement('button');
        createBtn.className = 'btn';
        createBtn.style.cssText = 'width:100%; font-size:0.72rem; margin-bottom:6px;';
        createBtn.innerHTML = '<i class="fas fa-clone"></i> Create Mixin from Element';
        createBtn.addEventListener('click', () => {
            const suggested = entity.id ? entity.id + ' Mixin' : 'New Mixin';
            const name = window.prompt('Mixin name:', suggested);
            if (!name) return;
            system.createFromElement(entity, name);
            this.renderAFramePropertiesPanel(entity);
        });
        group.appendChild(createBtn);

        const mixins = system.getMixins();
        const applied = new Set(system.getAppliedMixinIds(entity));

        if (mixins.length === 0) {
            const empty = document.createElement('div');
            empty.style.cssText = 'font-size:0.72rem; color:var(--text-secondary);';
            empty.textContent = 'No mixins yet. Create one from an element to reuse its components.';
            group.appendChild(empty);
        }

        mixins.forEach(mixin => {
            const row = document.createElement('div');
            row.style.cssText = 'display:flex; align-items:center; gap:6px; background:var(--bg-light); border:1px solid var(--border-color); border-radius:4px; padding:5px 6px; margin-bottom:4px; font-size:0.7rem;';

            const name = document.createElement('span');
            name.style.flex = '1';
            name.textContent = mixin.name;

            const applyBtn = document.createElement('button');
            applyBtn.className = 'btn icon-only';
            applyBtn.title = applied.has(mixin.id) ? 'Remove mixin from element' : 'Apply mixin to element';
            applyBtn.innerHTML = applied.has(mixin.id)
                ? '<i class="fas fa-check"></i>'
                : '<i class="fas fa-plus"></i>';
            applyBtn.addEventListener('click', () => {
                if (applied.has(mixin.id)) system.removeFromElement(entity, mixin.id);
                else system.applyToElement(entity, mixin.id);
                this.renderAFramePropertiesPanel(entity);
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn icon-only';
            deleteBtn.title = 'Delete mixin';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', () => {
                if (!window.confirm(`Delete mixin "${mixin.name}"?`)) return;
                system.deleteMixin(mixin.id);
                this.renderAFramePropertiesPanel(entity);
            });

            row.appendChild(name);
            row.appendChild(applyBtn);
            row.appendChild(deleteBtn);
            group.appendChild(row);
        });

        this.propsContent.appendChild(group);
    }

    renderAFrameSceneSettings() {
        const scene = document.getElementById('aframe-scene');
        const globals = this.app.globalsSystem;
        if (!scene) {
            this.propsContent.innerHTML = '<div class="empty-state"><p>A-Frame scene is loading...</p></div>';
            return;
        }

        const header = document.createElement('div');
        header.className = 'property-group';
        header.innerHTML = '<div style="font-weight:bold; color:var(--accent-primary); border-bottom:1px solid #333; padding-bottom:5px;">Scene / World</div>';
        this.propsContent.appendChild(header);

        const fogAttr = scene.getAttribute('fog') || {};
        const fogEnabled = scene.hasAttribute('fog');
        const fogDensity = Number(fogAttr.density ?? 0.028);
        const fogColor = typeof fogAttr.color === 'object' && fogAttr.color.getHexString
            ? '#' + fogAttr.color.getHexString()
            : (fogAttr.color || '#1a1a2e');

        const fogGroup = document.createElement('div');
        fogGroup.className = 'property-group';
        fogGroup.innerHTML = `
            <label style="display:flex; align-items:center; gap:8px; font-size:0.8rem;"><input type="checkbox" class="fog-enabled" ${fogEnabled ? 'checked' : ''}> Fog</label>
            <div class="input-group"><span>Color</span><input type="color" class="fog-color" value="${fogColor}"></div>
            <div class="input-group"><span>Density</span><input type="number" class="fog-density" min="0" max="0.2" step="0.002" value="${fogDensity}"></div>
        `;

        const applyFog = () => {
            if (!fogGroup.querySelector('.fog-enabled').checked) {
                scene.removeAttribute('fog');
                return;
            }
            scene.setAttribute('fog', {
                type: 'exponential',
                color: fogGroup.querySelector('.fog-color').value,
                density: Number(fogGroup.querySelector('.fog-density').value)
            });
        };
        fogGroup.querySelector('.fog-enabled').addEventListener('change', applyFog);
        fogGroup.querySelector('.fog-color').addEventListener('input', applyFog);
        fogGroup.querySelector('.fog-density').addEventListener('change', applyFog);
        this.propsContent.appendChild(fogGroup);

        const shadowAttr = scene.getAttribute('shadow');
        const shadowEnabled = !!shadowAttr || scene.hasAttribute('shadow');
        const shadowGroup = document.createElement('div');
        shadowGroup.className = 'property-group';
        shadowGroup.innerHTML = `
            <label style="display:flex; align-items:center; gap:8px; font-size:0.8rem;"><input type="checkbox" class="shadow-enabled" ${shadowEnabled ? 'checked' : ''}> Shadows</label>
            <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:4px;">Add shadows to all scene lights.</div>
        `;
        shadowGroup.querySelector('.shadow-enabled').addEventListener('change', (e) => {
            if (e.target.checked) {
                scene.setAttribute('shadow', 'type', 'pcfsoft');
                scene.querySelectorAll('a-light').forEach(light => {
                    light.setAttribute('shadow', 'cast', true);
                });
            } else {
                scene.removeAttribute('shadow');
                scene.querySelectorAll('a-light').forEach(light => {
                    light.removeAttribute('shadow');
                });
            }
        });
        this.propsContent.appendChild(shadowGroup);

        // Global background and environment presets.
        if (globals) {
            const background = globals.get('background') || {};
            const environment = globals.get('environment') || {};
            const worldGroup = document.createElement('div');
            worldGroup.className = 'property-group';
            const presets = ['default', 'forest', 'tron', 'starry', 'contact', 'egypt', 'checkerboard', 'osiris', 'dream', 'volcano', 'arches', 'japan'];
            worldGroup.innerHTML = `
                <div class="property-label">World</div>
                <div class="input-group"><span>Background</span><input type="color" class="world-background" value="${typeof background.color === 'string' ? background.color : '#1a1a2e'}"></div>
                <div class="input-group"><span>Environment</span>
                    <select class="component-select world-environment">
                        ${presets.map(preset => `<option value="${preset}" ${environment.preset === preset ? 'selected' : ''}>${preset}</option>`).join('')}
                    </select>
                </div>
            `;
            worldGroup.querySelector('.world-background').addEventListener('input', (e) => {
                globals.set('background', { color: e.target.value });
            });
            worldGroup.querySelector('.world-environment').addEventListener('change', (e) => {
                globals.set('environment', { preset: e.target.value });
            });
            this.propsContent.appendChild(worldGroup);
        }

        // Sky colour / skybox shortcut
        const skyEl = scene.querySelector('a-sky');
        const rawSkyColor = skyEl ? skyEl.getAttribute('color') : null;
        const skyColor = rawSkyColor && typeof rawSkyColor === 'object' && rawSkyColor.getHexString
            ? '#' + rawSkyColor.getHexString()
            : (typeof rawSkyColor === 'string' && /^#[0-9a-f]{3,8}$/i.test(rawSkyColor) ? rawSkyColor : '#1a1a2e');
        const skyGroup = document.createElement('div');
        skyGroup.className = 'property-group';
        skyGroup.innerHTML = `
            <div class="property-label">Sky / Skybox</div>
            <div class="input-group"><span>Color</span><input type="color" class="sky-color" value="${skyColor}"></div>
            <button class="btn" style="width:100%; margin-top:6px;"><i class="fas fa-plus"></i> ${skyEl ? 'Update Sky Colour' : 'Add Skybox'}</button>
        `;
        const ensureSky = (color) => {
            let sky = scene.querySelector('a-sky');
            if (!sky) {
                sky = this.app.aframeManager?.addEntity('a-sky', { color }) || document.createElement('a-sky');
                if (!sky.parentNode) scene.appendChild(sky);
            }
            sky.setAttribute('color', color);
            return sky;
        };
        skyGroup.querySelector('.sky-color').addEventListener('input', (e) => {
            ensureSky(e.target.value);
        });
        skyGroup.querySelector('button').addEventListener('click', () => {
            const sky = ensureSky(skyGroup.querySelector('.sky-color').value);
            this.app.aframeManager?.selectEntity(sky);
        });
        this.propsContent.appendChild(skyGroup);

        const hint = document.createElement('div');
        hint.className = 'property-group';
        hint.style.cssText = 'font-size:0.72rem; color:var(--text-secondary);';
        hint.innerHTML = '<i class="fas fa-lightbulb"></i> Select an A-Frame element to edit its position, media and behaviours.';
        this.propsContent.appendChild(hint);
    }

    renderPropertiesPanel(selectedObject) {
        this.propsContent.innerHTML = '';

        if (!selectedObject) {
            this.propsContent.innerHTML = '<div class="empty-state"> <p>Click on an object to edit properties</p><br> <p>Right click to deselect an object</p></div>';
            return;
        }

        const obj = selectedObject;
        let title = "Object";
        let isLight = false;
        let isShape = false;
        let isFigurePart = false;
        let isFigure = false;

        // Determine Title based on name override or type
        if (obj.userData.name) {
            title = obj.userData.name;
            if (obj.userData.name.includes('Joint')) isFigurePart = true;
        } else if (obj.userData.type === 'shape') {
            title = obj.userData.shapeType.toUpperCase(); isShape = true;
        } else if (obj.userData.type === 'light') {
            title = obj.userData.lightType.toUpperCase() + " LIGHT"; isLight = true;
        } else if (obj.userData.type === 'figure') {
            title = obj.userData.gender.toUpperCase() + " FIGURE";
            isFigure = true;
        }

        // Header
        const header = document.createElement('div');
        header.className = 'property-group';
        header.innerHTML = `<div style="font-weight:bold; color:var(--accent-primary); border-bottom:1px solid #333; padding-bottom:5px;">${title}</div>`;
        this.propsContent.appendChild(header);

        // JOINT CONTROLS
        if (isFigurePart) {
            const jointGroup = document.createElement('div');
            jointGroup.className = 'property-group';
            jointGroup.innerHTML = `<div class="property-label">Joint Controls</div><div style="font-size:0.8rem; color:#94a3b8;">Use the transform tools (G/R/S) to pose this joint. Select parent/child joints for full control.</div>`;
            this.propsContent.appendChild(jointGroup);
        }

        // Helper: Create Input
        const createInput = (label, id, value, onChange) => {
            const div = document.createElement('div');
            div.className = 'input-group';
            div.innerHTML = `<span>${label}</span><input type="number" id="${id}" value="${value.toFixed(2)}" step="0.1">`;
            div.querySelector('input').addEventListener('input', (e) => onChange(parseFloat(e.target.value)));
            return div;
        };

        // Helper: Create Vector3 Inputs
        const createVec3 = (label, prefix, vec, onChangeObj) => {
            const group = document.createElement('div');
            group.className = 'property-group';
            group.innerHTML = `<div class="property-label">${label}</div>`;
            const row = document.createElement('div');
            row.className = 'input-row';

            row.appendChild(createInput('X', `${prefix}-x`, vec.x, (v) => { vec.x = v; onChangeObj(); }));
            row.appendChild(createInput('Y', `${prefix}-y`, vec.y, (v) => { vec.y = v; onChangeObj(); }));
            row.appendChild(createInput('Z', `${prefix}-z`, vec.z, (v) => { vec.z = v; onChangeObj(); }));

            group.appendChild(row);
            this.propsContent.appendChild(group);
        };

        // FIGURE CONTROLS
        if (isFigure) {
            const figureGroup = document.createElement('div');
            figureGroup.className = 'property-group';
            figureGroup.innerHTML = `<div class="property-label">Figure Controls</div>`;

            const figureControls = document.createElement('div');
            figureControls.className = 'figure-controls';

            // Gender Switch
            const genderSwitch = document.createElement('div');
            genderSwitch.className = 'gender-switch';
            genderSwitch.innerHTML = `
                <button class="gender-btn ${obj.userData.gender === 'male' ? 'active' : ''}" data-gender="male">
                    <i class="fas fa-male"></i> Male
                </button>
                <button class="gender-btn ${obj.userData.gender === 'female' ? 'active' : ''}" data-gender="female">
                    <i class="fas fa-female"></i> Female
                </button>
            `;

            genderSwitch.querySelectorAll('.gender-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const newGender = e.currentTarget.dataset.gender;
                    if (newGender !== obj.userData.gender) {
                        this.app.changeFigureGender(obj, newGender);
                    }
                });
            });

            figureControls.appendChild(genderSwitch);
            figureGroup.appendChild(figureControls);
            this.propsContent.appendChild(figureGroup);
        }

        // TRANSFORM CONTROLS
        createVec3('Position', 'pos', obj.position, () => { });
        createVec3('Rotation', 'rot', obj.rotation, () => { });
        createVec3('Scale', 'scl', obj.scale, () => { });

        // COLOR (Shapes & Figure Parts)
        let targetMesh = null;
        if (isShape) targetMesh = obj;
        if (isFigurePart) {
            // Find the mesh inside the group (limbs are groups with mesh children)
            targetMesh = obj.children.find(c => c.isMesh);
        } else if (obj.userData.type === 'figure') {
            // Try to color pelvis as proxy for figure
            targetMesh = obj.children.find(c => c.userData.name === 'Pelvis');
        }

        if (targetMesh && targetMesh.material) {
            // Add Materials Selector
            this.addMaterialsSelector(obj, targetMesh);

            const colorGroup = document.createElement('div');
            colorGroup.className = 'property-group';

            // Flex container for label + AI button
            const lblRow = document.createElement('div');
            lblRow.style.display = 'flex';
            lblRow.style.justifyContent = 'space-between';
            lblRow.innerHTML = `<div class="property-label">Color</div> <i class="fas fa-wand-magic-sparkles" style="font-size:0.7rem; cursor:pointer; color:#a855f7;" title="AI Material Assistant"></i>`;

            // Add click listener for AI button
            lblRow.querySelector('i').addEventListener('click', () => {
                this.openAIModal('material');
            });
            colorGroup.appendChild(lblRow);

            const colInput = document.createElement('input');
            colInput.type = 'color';
            colInput.id = 'prop-color-picker'; // ID for easier targeting
            colInput.value = '#' + targetMesh.material.color.getHexString();
            colInput.addEventListener('input', (e) => {
                const hex = e.target.value;
                if (obj.userData.type === 'figure') {
                    // Color whole figure
                    obj.traverse(c => { if (c.isMesh) c.material.color.set(hex); });
                } else {
                    targetMesh.material.color.set(hex);
                }
            });
            colorGroup.appendChild(colInput);
            this.propsContent.appendChild(colorGroup);

            // Add PBR Material Properties (Metallic and Roughness)
            this.addMaterialProperties(obj, targetMesh);
        }

        // LIGHT PROPERTIES
        if (isLight) {
            const lightObj = obj.children[0]; // The actual light is inside the container

            const intGroup = document.createElement('div');
            intGroup.className = 'property-group';
            intGroup.innerHTML = `<div class="property-label">Intensity</div>`;
            const intInput = document.createElement('input');
            intInput.type = 'range';
            intInput.min = 0; intInput.max = 100;
            intInput.value = lightObj.intensity;
            intInput.style.width = '100%';
            intInput.addEventListener('input', (e) => {
                lightObj.intensity = parseFloat(e.target.value);
            });
            intGroup.appendChild(intInput);
            this.propsContent.appendChild(intGroup);

            const lColGroup = document.createElement('div');
            lColGroup.className = 'property-group';
            lColGroup.innerHTML = `<div class="property-label">Light Color</div>`;
            const lColInput = document.createElement('input');
            lColInput.type = 'color';
            lColInput.value = '#' + lightObj.color.getHexString();
            lColInput.addEventListener('input', (e) => {
                lightObj.color.set(e.target.value);
            });
            lColGroup.appendChild(lColInput);
            this.propsContent.appendChild(lColGroup);
        }
    }

    // Add PBR Material Properties (Metallic and Roughness)
    addMaterialProperties(obj, targetMesh) {
        // Create material properties group
        const materialGroup = document.createElement('div');
        materialGroup.className = 'property-group';
        materialGroup.innerHTML = `<div class="property-label">Material Properties (PBR)</div>`;

        // Metallic property
        const metallicRow = document.createElement('div');
        metallicRow.className = 'input-row';
        metallicRow.style.marginBottom = '4px';

        const metallicLabel = document.createElement('span');
        metallicLabel.style.fontSize = '0.65rem';
        metallicLabel.style.color = 'var(--text-secondary)';
        metallicLabel.style.width = '60px';
        metallicLabel.textContent = 'Metallic:';
        metallicRow.appendChild(metallicLabel);

        const metallicInput = document.createElement('input');
        metallicInput.type = 'range';
        metallicInput.id = 'prop-metallic-slider';
        metallicInput.min = '0';
        metallicInput.max = '1';
        metallicInput.step = '0.01';
        metallicInput.style.flex = '1';

        // Add info button for metallic
        const metallicInfo = document.createElement('i');
        metallicInfo.className = 'fas fa-info-circle material-info-btn';
        metallicInfo.title = 'Metallic: Controls how metallic the surface appears (0 = non-metal, 1 = fully metallic). Affects reflectivity and edge sharpness.';
        metallicInfo.style.marginLeft = '4px';
        metallicInfo.style.cursor = 'help';
        metallicInfo.style.color = 'var(--text-secondary)';
        metallicInfo.style.fontSize = '0.7rem';
        metallicRow.appendChild(metallicInfo);

        // Initialize metallic value (default to 0 if not set)
        const currentMetallic = targetMesh.material.metalness !== undefined
            ? targetMesh.material.metalness
            : 0;
        metallicInput.value = currentMetallic;

        metallicInput.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (obj.userData.type === 'figure') {
                // Apply to whole figure
                obj.traverse(c => {
                    if (c.isMesh && c.material) {
                        c.material.metalness = value;
                    }
                });
            } else {
                targetMesh.material.metalness = value;
            }
        });

        metallicRow.appendChild(metallicInput);
        materialGroup.appendChild(metallicRow);

        // Roughness property
        const roughnessRow = document.createElement('div');
        roughnessRow.className = 'input-row';

        const roughnessLabel = document.createElement('span');
        roughnessLabel.style.fontSize = '0.65rem';
        roughnessLabel.style.color = 'var(--text-secondary)';
        roughnessLabel.style.width = '60px';
        roughnessLabel.textContent = 'Roughness:';
        roughnessRow.appendChild(roughnessLabel);

        const roughnessInput = document.createElement('input');
        roughnessInput.type = 'range';
        roughnessInput.id = 'prop-roughness-slider';
        roughnessInput.min = '0';
        roughnessInput.max = '1';
        roughnessInput.step = '0.01';
        roughnessInput.style.flex = '1';

        // Add info button for roughness
        const roughnessInfo = document.createElement('i');
        roughnessInfo.className = 'fas fa-info-circle material-info-btn';
        roughnessInfo.title = 'Roughness: Controls surface smoothness (0 = perfectly smooth/mirror-like, 1 = very rough). Affects how light scatters across the surface.';
        roughnessInfo.style.marginLeft = '4px';
        roughnessInfo.style.cursor = 'help';
        roughnessInfo.style.color = 'var(--text-secondary)';
        roughnessInfo.style.fontSize = '0.7rem';
        roughnessRow.appendChild(roughnessInfo);

        // Initialize roughness value (default to 0.5 if not set)
        const currentRoughness = targetMesh.material.roughness !== undefined
            ? targetMesh.material.roughness
            : 0.5;
        roughnessInput.value = currentRoughness;

        roughnessInput.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (obj.userData.type === 'figure') {
                // Apply to whole figure
                obj.traverse(c => {
                    if (c.isMesh && c.material) {
                        c.material.roughness = value;
                    }
                });
            } else {
                targetMesh.material.roughness = value;
            }
        });

        roughnessRow.appendChild(roughnessInput);
        materialGroup.appendChild(roughnessRow);

        this.propsContent.appendChild(materialGroup);
    }

    // Add Materials Selector to Properties Panel
    addMaterialsSelector(obj, targetMesh) {
        if (!this.app.materialsManager) return;

        const materialsGroup = document.createElement('div');
        materialsGroup.className = 'property-group';

        // Create materials selector header
        const selectorHeader = document.createElement('div');
        selectorHeader.style.display = 'flex';
        selectorHeader.style.justifyContent = 'space-between';
        selectorHeader.style.alignItems = 'center';
        selectorHeader.style.marginBottom = '6px';

        const selectorLabel = document.createElement('div');
        selectorLabel.className = 'property-label';
        selectorLabel.textContent = 'Material';
        selectorHeader.appendChild(selectorLabel);

        // Add create new material button
        const createMaterialBtn = document.createElement('button');
        createMaterialBtn.className = 'btn folder-btn';
        createMaterialBtn.style.fontSize = '0.6rem';
        createMaterialBtn.style.padding = '2px 4px';
        createMaterialBtn.innerHTML = '<i class="fas fa-plus" style="font-size: 0.7rem;"></i>';
        createMaterialBtn.title = 'Create New Material';
        createMaterialBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.app.materialsManager.createNewMaterial();
        });
        selectorHeader.appendChild(createMaterialBtn);

        materialsGroup.appendChild(selectorHeader);

        // Create custom materials dropdown wrapper
        const dropdownWrapper = document.createElement('div');
        dropdownWrapper.className = 'material-dropdown-wrapper';

        // Create the visible dropdown button
        const dropdownButton = document.createElement('div');
        dropdownButton.className = 'material-selector';
        dropdownButton.innerHTML = `
            <span class="selected-material-text">Select a material...</span>
            <svg class="dropdown-arrow" fill="white" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10l5 5 5-5z"/>
            </svg>
        `;

        // Create the dropdown list (hidden by default)
        const dropdownList = document.createElement('div');
        dropdownList.className = 'material-dropdown-list';

        // Add default item
        const defaultItem = document.createElement('div');
        defaultItem.className = 'material-dropdown-item';
        defaultItem.innerHTML = `
            <div class="material-color-swatch" style="background-color: transparent; border: 1px dashed var(--border-color);"></div>
            <span class="material-option-text">Select a material...</span>
        `;
        defaultItem.addEventListener('click', () => {
            dropdownButton.querySelector('.selected-material-text').textContent = 'Select a material...';
            dropdownList.classList.remove('show');
        });
        dropdownList.appendChild(defaultItem);

        // Add materials from materials manager
        this.app.materialsManager.materials.forEach(material => {
            // Convert hex color to CSS format
            const colorHex = material.color ? '#' + material.color.toString(16).padStart(6, '0') : '#ffffff';

            const dropdownItem = document.createElement('div');
            dropdownItem.className = 'material-dropdown-item';
            dropdownItem.dataset.materialId = material.id;
            dropdownItem.innerHTML = `
                <div class="material-color-swatch" style="background-color: ${colorHex}; border: 1px solid var(--border-color);"></div>
                <span class="material-option-text">${material.name} (M:${material.metalness.toFixed(1)}, R:${material.roughness.toFixed(1)})</span>
            `;

            dropdownItem.addEventListener('click', () => {
                // Remove selected class from all items
                dropdownList.querySelectorAll('.material-dropdown-item').forEach(item => {
                    item.classList.remove('selected');
                });

                // Add selected class to clicked item
                dropdownItem.classList.add('selected');

                dropdownButton.querySelector('.selected-material-text').textContent = dropdownItem.querySelector('.material-option-text').textContent;
                dropdownList.classList.remove('show');
                dropdownWrapper.classList.remove('open');

                // Apply the selected material
                const materialId = dropdownItem.dataset.materialId;
                const material = this.app.materialsManager.materials.find(m => m.id === materialId);
                if (material) {
                    this.app.materialsManager.applyMaterialToSelected(material);
                }
            });

            dropdownList.appendChild(dropdownItem);
        });

        // Add click handler to toggle dropdown
        dropdownButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdownList.classList.contains('show');
            if (isOpen) {
                dropdownList.classList.remove('show');
                dropdownWrapper.classList.remove('open');
            } else {
                dropdownList.classList.add('show');
                dropdownWrapper.classList.add('open');
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdownWrapper.contains(e.target)) {
                dropdownList.classList.remove('show');
                dropdownWrapper.classList.remove('open');
            }
        });

        dropdownWrapper.appendChild(dropdownButton);
        dropdownWrapper.appendChild(dropdownList);
        materialsGroup.appendChild(dropdownWrapper);
        this.propsContent.appendChild(materialsGroup);
    }

    // Method to update material properties UI when a material is selected
    updateMaterialPropertiesUI(material, targetMesh) {
        if (!material || !targetMesh) return;

        // Update color picker
        const colorPicker = document.getElementById('prop-color-picker');
        if (colorPicker) {
            colorPicker.value = '#' + material.color.toString(16).padStart(6, '0');
        }

        // Update metallic slider using specific ID
        const metallicInput = document.getElementById('prop-metallic-slider');
        if (metallicInput) {
            metallicInput.value = material.metalness;
        }

        // Update roughness slider using specific ID
        const roughnessInput = document.getElementById('prop-roughness-slider');
        if (roughnessInput) {
            roughnessInput.value = material.roughness;
        }

        // Update the actual material properties on the mesh
        targetMesh.material.color.setHex(material.color);
        targetMesh.material.metalness = material.metalness;
        targetMesh.material.roughness = material.roughness;
    }

    showNotification(message, type = 'info') {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.textContent = message;

        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '12px 20px';
        notification.style.borderRadius = '4px';
        notification.style.color = '#fff';
        notification.style.fontSize = '12px';
        notification.style.fontWeight = 'bold';
        notification.style.zIndex = '10000';
        notification.style.border = '1px solid rgba(255,255,255,0.2)';
        notification.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
        notification.style.transition = 'all 0.3s ease';
        notification.style.transform = 'translateY(-20px)';
        notification.style.opacity = '0';

        const colors = { success: '#00ff41', error: '#ff006e', info: '#00d9ff' };
        notification.style.backgroundColor = '#1a1a2e';
        notification.style.borderLeft = `4px solid ${colors[type] || colors.info}`;

        document.body.appendChild(notification);

        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        });

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    renderSceneSettingsPanel() {
        const container = document.getElementById('scene-content');
        const scene = document.getElementById('aframe-scene');
        const globals = this.app.globalsSystem;
        if (!container) return;

        container.innerHTML = '';
        if (!this._sceneCollapsedSections) this._sceneCollapsedSections = new Set();

        const fog = globals?.get('fog') || scene?.getAttribute('fog') || {};
        const background = globals?.get('background') || {};
        const environment = globals?.get('environment') || {};
        const skyEl = scene?.querySelector('a-sky');
        const ambient = scene?.querySelector('a-light[type="ambient"]') || scene?.querySelector('a-light');
        const camera = scene?.querySelector('a-camera');
        const cameraRig = camera?.parentElement?.id?.includes('camera-rig') ? camera.parentElement : camera;
        const shadowEnabled = !!scene?.hasAttribute('shadow');

        const addSection = (id, title, build) => {
            const section = document.createElement('div');
            section.className = 'collapsible-section';
            const header = document.createElement('div');
            header.className = 'collapsible-header';
            header.innerHTML = `<span>${title}</span><i class="fas fa-chevron-down"></i>`;
            const content = document.createElement('div');
            content.className = 'collapsible-content';
            const collapsed = this._sceneCollapsedSections.has(id);
            content.style.display = collapsed ? 'none' : 'block';
            header.classList.toggle('collapsed', collapsed);
            header.addEventListener('click', () => {
                const hidden = content.style.display === 'none';
                content.style.display = hidden ? 'block' : 'none';
                header.classList.toggle('collapsed', !hidden);
                if (hidden) this._sceneCollapsedSections.delete(id);
                else this._sceneCollapsedSections.add(id);
            });
            build(content);
            section.appendChild(header);
            section.appendChild(content);
            container.appendChild(section);
        };

        const addCheckbox = (parent, label, checked, onChange) => {
            const group = document.createElement('div');
            group.className = 'property-group';
            group.innerHTML = `<label class="property-label"><input type="checkbox" ${checked ? 'checked' : ''}> ${label}</label>`;
            group.querySelector('input').addEventListener('change', e => onChange(e.target.checked));
            parent.appendChild(group);
        };

        const addInput = (parent, label, type, value, onChange, attrs = '') => {
            const group = document.createElement('div');
            group.className = 'property-group';
            group.innerHTML = `<label class="property-label">${label}<input type="${type}" value="${value ?? ''}" ${attrs}></label>`;
            group.querySelector('input').addEventListener('change', e => onChange(type === 'number' ? Number(e.target.value) : e.target.value));
            parent.appendChild(group);
            return group.querySelector('input');
        };

        const addSelect = (parent, label, options, value, onChange) => {
            const group = document.createElement('div');
            group.className = 'property-group';
            const select = document.createElement('select');
            select.className = 'component-select';
            options.forEach(optionValue => {
                const option = document.createElement('option');
                option.value = optionValue;
                option.textContent = optionValue;
                select.appendChild(option);
            });
            select.value = value;
            select.addEventListener('change', () => onChange(select.value));
            group.innerHTML = `<label class="property-label">${label}</label>`;
            group.appendChild(select);
            parent.appendChild(group);
            return select;
        };

        const applyFog = () => {
            if (!fogEnabled.checked) {
                scene?.removeAttribute('fog');
                return;
            }
            scene?.setAttribute('fog', {
                type: fogType.value,
                color: fogColor.value,
                near: Number(fogNear.value),
                far: Number(fogFar.value),
                density: Number(fogDensity.value)
            });
        };

        let fogEnabled, fogColor, fogNear, fogFar, fogDensity, fogType;

        addSection('scene', 'Scene', body => {
            const savedTitle = localStorage.getItem('pixelAFrame-scene-title') || 'My Scene';
            addInput(body, 'Scene Title', 'text', savedTitle, value => {
                localStorage.setItem('pixelAFrame-scene-title', value);
                document.title = `${value} - Pixel AFrame`;
            });
            addCheckbox(body, 'Ambient Occlusion', localStorage.getItem('pixelAFrame-ao') === 'true', value => {
                localStorage.setItem('pixelAFrame-ao', value ? 'true' : 'false');
                this.showNotification(`Ambient occlusion ${value ? 'enabled' : 'disabled'} (preview setting)`, 'info');
            });
            addCheckbox(body, 'Bloom Effect', localStorage.getItem('pixelAFrame-bloom') === 'true', value => {
                localStorage.setItem('pixelAFrame-bloom', value ? 'true' : 'false');
                this.showNotification(`Bloom ${value ? 'enabled' : 'disabled'} (preview setting)`, 'info');
            });
        });

        addSection('camera', 'Play Camera', body => {
            const fov = camera?.getAttribute('camera')?.fov || 80;
            addInput(body, 'Field of view', 'number', fov, value => {
                camera?.setAttribute('camera', 'fov', value);
            }, 'min="30" max="120" step="1"');
            const pos = cameraRig?.getAttribute('position') || { y: 1.6 };
            addInput(body, 'Camera height', 'number', pos.y ?? 1.6, value => {
                cameraRig?.setAttribute('position', `${pos.x || 0} ${value} ${pos.z || 5}`);
            }, 'step="0.1"');
            addCheckbox(body, 'Enable WASD movement', camera?.hasAttribute('wasd-controls') !== false, value => {
                if (value) camera?.setAttribute('wasd-controls', '');
                else camera?.removeAttribute('wasd-controls');
            });
        });

        addSection('light', 'Light', body => {
            addCheckbox(body, 'Ambient light', ambient ? ambient.getAttribute('visible') !== false : true, value => {
                ambient?.setAttribute('visible', value);
            });
            addInput(body, 'Ambient colour', 'color', ambient?.getAttribute('color') || '#ffffff', value => {
                ambient?.setAttribute('color', value);
            });
            addInput(body, 'Ambient intensity', 'number', Number(ambient?.getAttribute('intensity') ?? 1), value => {
                ambient?.setAttribute('intensity', value);
            }, 'min="0" max="3" step="0.1"');
            const directional = scene?.querySelector('a-light[type="directional"]');
            addInput(body, 'Directional intensity', 'number', Number(directional?.getAttribute('intensity') ?? 1), value => {
                directional?.setAttribute('intensity', value);
            }, 'min="0" max="3" step="0.1"');
        });

        addSection('simulation', 'Simulation', body => {
            addCheckbox(body, 'Pointer drag enabled', true, value => {
                scene?.querySelectorAll('[studio-drag]').forEach(el => el.setAttribute('studio-drag', 'enabled', value));
            });
            addCheckbox(body, 'Show clickable hint', localStorage.getItem('pixelAFrame-click-hint') !== 'false', value => {
                localStorage.setItem('pixelAFrame-click-hint', value ? 'true' : 'false');
            });
        });

        addSection('effects', 'Effects', body => {
            addSelect(body, 'Environment preset', ['default', 'forest', 'tron', 'starry', 'contact', 'egypt', 'checkerboard', 'osiris', 'dream', 'volcano', 'arches', 'japan'], environment.preset || 'default', value => {
                globals?.set('environment', { ...environment, preset: value });
            });
            addSelect(body, 'Sky type', ['atmosphere', 'gradient', 'none'], environment.skyType || 'atmosphere', value => {
                globals?.set('environment', { ...environment, skyType: value });
            });
            addSelect(body, 'Lighting', ['distant', 'point', 'none'], environment.lighting || 'distant', value => {
                globals?.set('environment', { ...environment, lighting: value });
            });
        });

        addSection('fog', 'Fog', body => {
            fogEnabled = document.createElement('input');
            fogEnabled.type = 'checkbox';
            fogEnabled.checked = scene?.hasAttribute('fog') || false;
            const toggleGroup = document.createElement('div');
            toggleGroup.className = 'property-group';
            toggleGroup.innerHTML = '<label class="property-label"><input type="checkbox"> Enable Fog</label>';
            toggleGroup.querySelector('input').checked = fogEnabled.checked;
            fogEnabled = toggleGroup.querySelector('input');
            body.appendChild(toggleGroup);

            const colorGroup = addInput(body, 'Fog colour', 'color', typeof fog.color === 'object' && fog.color.getHexString ? '#' + fog.color.getHexString() : (fog.color || '#1a1a2e'), () => applyFog());
            fogColor = colorGroup;
            addCheckbox(body, 'Match fog to background', localStorage.getItem('pixelAFrame-fog-match') === 'true', value => {
                localStorage.setItem('pixelAFrame-fog-match', value ? 'true' : 'false');
                if (value && background.color) { fogColor.value = background.color; applyFog(); }
            });
            fogType = addSelect(body, 'Fog type', ['linear', 'exponential'], fog.type || 'linear', () => applyFog());
            fogNear = addInput(body, 'Fog near', 'number', Number(fog.near ?? 30), () => applyFog(), 'step="1"');
            fogFar = addInput(body, 'Fog far', 'number', Number(fog.far ?? 100), () => applyFog(), 'step="1"');
            fogDensity = addInput(body, 'Fog density', 'number', Number(fog.density ?? 0.028), () => applyFog(), 'min="0" max="1" step="0.001"');
            fogEnabled.addEventListener('change', applyFog);
        });

        addSection('sky', 'Sky', body => {
            const skyColor = skyEl ? (typeof skyEl.getAttribute('color') === 'object' ? '#' + skyEl.getAttribute('color').getHexString() : skyEl.getAttribute('color')) : '#1a1a2e';
            addInput(body, 'Sky colour', 'color', skyColor || '#1a1a2e', value => {
                let sky = scene?.querySelector('a-sky');
                if (!sky) sky = this.app.aframeManager?.addEntity('a-sky', { color: value });
                sky?.setAttribute('color', value);
            });
            addInput(body, 'Sky image URL', 'text', skyEl?.getAttribute('src') || '', value => {
                let sky = scene?.querySelector('a-sky');
                if (!sky) sky = this.app.aframeManager?.addEntity('a-sky', {});
                if (value) sky?.setAttribute('src', value);
                else sky?.removeAttribute('src');
            }, 'placeholder="https://..."');
        });

        addSection('shadows', 'Ambient Shadows', body => {
            addCheckbox(body, 'Enable shadows', shadowEnabled, value => {
                globals?.setShadows(value);
            });
            addSelect(body, 'Shadow quality', ['basic', 'pcf', 'pcfsoft'], scene?.getAttribute('shadow')?.type || 'pcfsoft', value => {
                globals?.setShadows(true, value);
            });
        });

        addSection('color', 'Colour', body => {
            addInput(body, 'Background colour', 'color', typeof background.color === 'string' ? background.color : '#1a1a2e', value => {
                globals?.set('background', { ...background, color: value });
            });
            addInput(body, 'Gradient top', 'color', localStorage.getItem('pixelAFrame-gradient-top') || '#1a1a2e', value => {
                localStorage.setItem('pixelAFrame-gradient-top', value);
            });
            addInput(body, 'Gradient bottom', 'color', localStorage.getItem('pixelAFrame-gradient-bottom') || '#0b1220', value => {
                localStorage.setItem('pixelAFrame-gradient-bottom', value);
            });
        });

        const expandBtn = document.getElementById('scene-expand-all');
        const collapseBtn = document.getElementById('scene-collapse-all');
        if (expandBtn) expandBtn.onclick = () => {
            this._sceneCollapsedSections.clear();
            container.querySelectorAll('.collapsible-content').forEach(el => el.style.display = 'block');
            container.querySelectorAll('.collapsible-header').forEach(el => el.classList.remove('collapsed'));
        };
        if (collapseBtn) collapseBtn.onclick = () => {
            container.querySelectorAll('.collapsible-content').forEach(el => el.style.display = 'none');
            container.querySelectorAll('.collapsible-header').forEach(el => {
                el.classList.add('collapsed');
                this._sceneCollapsedSections.add(el.querySelector('span').textContent.toLowerCase());
            });
        };
    }

    initSceneExport() {
        // Initialize export button
        const exportBtn = document.getElementById('btn-export-png');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportSceneAsPNG();
            });
        }

        // Initialize camera border toggle
        const borderToggle = document.getElementById('show-camera-border');
        if (borderToggle) {
            borderToggle.addEventListener('change', (e) => {
                this.toggleCameraBorder(e.target.checked);
            });
        }

        // Initialize canvas size controls
        const resolutionDropdown = document.getElementById('export-resolution');
        if (resolutionDropdown) {
            resolutionDropdown.addEventListener('change', () => this.updateCameraBorderFromDropdown());
        }

        // Initialize camera border visualization
        this.updateCameraBorder();

        // Make camera border preview draggable
        this.makeCameraBorderDraggable();
    }

    makeCameraBorderDraggable() {
        const preview = document.getElementById('camera-border-preview');
        if (!preview) return;

        let isDragging = false;
        let startX, startY;
        let initialX, initialY;

        // Add drag handle
        const dragHandle = document.createElement('div');
        dragHandle.style.position = 'absolute';
        dragHandle.style.top = '10px';
        dragHandle.style.right = '10px';
        dragHandle.style.width = '24px';
        dragHandle.style.height = '24px';
        dragHandle.style.background = 'var(--bg-medium)';
        dragHandle.style.border = '1px solid var(--border-color)';
        dragHandle.style.borderRadius = '4px';
        dragHandle.style.cursor = 'move';
        dragHandle.style.display = 'flex';
        dragHandle.style.alignItems = 'center';
        dragHandle.style.justifyContent = 'center';
        dragHandle.style.fontSize = '0.8rem';
        dragHandle.style.color = 'var(--text-secondary)';
        dragHandle.innerHTML = '📷';
        dragHandle.title = 'Drag to position camera border';
        preview.appendChild(dragHandle);

        // Add resize handle
        const resizeHandle = document.createElement('div');
        resizeHandle.style.position = 'absolute';
        resizeHandle.style.bottom = '0';
        resizeHandle.style.left = '0';
        resizeHandle.style.width = '16px';
        resizeHandle.style.height = '16px';
        resizeHandle.style.background = 'var(--bg-medium)';
        resizeHandle.style.border = '1px solid var(--border-color)';
        resizeHandle.style.borderRadius = '0 0 4px 0';
        resizeHandle.style.cursor = 'nwse-resize';
        resizeHandle.style.transform = 'translate(-50%, 50%)';
        resizeHandle.title = 'Drag to resize camera border';
        preview.appendChild(resizeHandle);

        // Add resize functionality
        let isResizing = false;
        let resizeStartX, resizeStartY;
        let resizeStartWidth, resizeStartHeight;

        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = preview.offsetWidth;
            startHeight = preview.offsetHeight;

            // Add resizing class
            preview.style.opacity = '0.8';
            preview.style.cursor = 'nwse-resize';
            preview.style.userSelect = 'none';

            e.preventDefault();
            e.stopPropagation();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            // Calculate new dimensions while maintaining aspect ratio
            const aspectRatio = startWidth / startHeight;
            let newWidth = startWidth + dx;
            let newHeight = newWidth / aspectRatio;

            // Apply minimum size constraints
            const minSize = 50;
            newWidth = Math.max(minSize, newWidth);
            newHeight = Math.max(minSize * aspectRatio, newHeight);

            // Apply new dimensions
            preview.style.width = `${newWidth}px`;
            preview.style.height = `${newHeight}px`;

            // Update the canvas size inputs to match the new dimensions
            const widthInput = document.getElementById('export-width');
            const heightInput = document.getElementById('export-height');
            if (widthInput && heightInput) {
                widthInput.value = Math.round(newWidth);
                heightInput.value = Math.round(newHeight);
            }
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                preview.style.opacity = '1';
                preview.style.cursor = 'move';

                // Update the camera border preview content
                const width = preview.offsetWidth;
                const height = preview.offsetHeight;
                const aspectRatio = width / height;

                preview.innerHTML = `
                    <div style="text-align: center; color: var(--text-secondary); font-size: 0.8rem;">
                        <div>Camera Border Preview</div>
                        <div style="margin-top: 8px; font-size: 0.7rem;">${Math.round(width)} × ${Math.round(height)}</div>
                        <div style="margin-top: 4px; font-size: 0.6rem;">Aspect Ratio: ${aspectRatio.toFixed(2)}</div>
                    </div>
                `;

                // Re-add drag and resize handles
                this.makeCameraBorderDraggable();
            }
        });

        // Mouse down event
        preview.addEventListener('mousedown', (e) => {
            if (e.target === dragHandle || e.target === preview) {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;

                // Get current position
                const rect = preview.getBoundingClientRect();
                initialX = rect.left;
                initialY = rect.top;

                // Add dragging class
                preview.style.opacity = '0.8';
                preview.style.cursor = 'grabbing';
                preview.style.userSelect = 'none';
                preview.style.pointerEvents = 'none';

                e.preventDefault();
            }
        });

        // Mouse move event
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            // Calculate new position
            let newX = initialX + dx;
            let newY = initialY + dy;

            // Get viewport dimensions
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Get preview dimensions
            const previewWidth = preview.offsetWidth;
            const previewHeight = preview.offsetHeight;

            // Constrain to viewport
            newX = Math.max(0, Math.min(newX, viewportWidth - previewWidth));
            newY = Math.max(0, Math.min(newY, viewportHeight - previewHeight));

            // Apply position
            preview.style.position = 'fixed';
            preview.style.left = `${newX}px`;
            preview.style.top = `${newY}px`;
            preview.style.zIndex = '10000';
        });

        // Mouse up event
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                preview.style.opacity = '1';
                preview.style.cursor = 'move';
                preview.style.userSelect = '';
                preview.style.pointerEvents = '';

                // Store position for persistence
                const position = {
                    x: parseFloat(preview.style.left) || 0,
                    y: parseFloat(preview.style.top) || 0
                };
                localStorage.setItem('cameraBorderPosition', JSON.stringify(position));
            }
        });

        // Load saved position
        const savedPosition = localStorage.getItem('cameraBorderPosition');
        if (savedPosition) {
            const pos = JSON.parse(savedPosition);
            preview.style.position = 'fixed';
            preview.style.left = `${pos.x}px`;
            preview.style.top = `${pos.y}px`;
            preview.style.zIndex = '10000';
        }
    }

    exportSceneAsPNG() {
        const width = parseInt(document.getElementById('export-width').value);
        const height = parseInt(document.getElementById('export-height').value);

        // Ensure renderer has preserveDrawingBuffer enabled
        if (this.app.renderer) {
            // Save current canvas size
            const originalWidth = this.app.renderer.domElement.width;
            const originalHeight = this.app.renderer.domElement.height;

            // Set renderer to export size and render
            this.app.renderer.setSize(width, height);
            this.app.renderer.render(this.app.scene, this.app.camera);

            // Get the canvas element and extract PNG data
            const canvas = this.app.renderer.domElement;
            const pngData = canvas.toDataURL('image/png');

            // Create download link
            const link = document.createElement('a');
            link.href = pngData;
            link.download = 'scene-export.png';
            link.click();

            // Restore original canvas size
            this.app.renderer.setSize(originalWidth, originalHeight);

            this.showNotification('Scene exported as PNG!', 'success');
        } else {
            this.showNotification('Error: Renderer not available', 'error');
        }
        
    }
    
    // Camera zoom methods
    zoomCamera(factor) {
        if (this.app.camera) {
            // Get current zoom level from slider
            const slider = document.getElementById('zoom-slider');
            let currentZoom = slider ? parseFloat(slider.value) : 50;

            // Apply zoom factor
            currentZoom *= factor;

            // Constrain to valid range
            currentZoom = Math.max(1, Math.min(100, currentZoom));

            // Update slider
            if (slider) {
                slider.value = currentZoom;
            }

            // Apply zoom to camera
            this.setCameraZoom(currentZoom);
        }
    }

    setCameraZoom(zoomLevel) {
        if (this.app.camera && this.app.cameraManager) {
            // Convert zoom level to camera position
            const zoomFactor = zoomLevel / 50; // 50 = neutral zoom
            this.app.cameraManager.setCameraZoom(zoomFactor);

            // Update the zoom display if needed
            this.updateZoomDisplay(zoomLevel);
        }
    }

    updateZoomDisplay(zoomLevel) {
        // You could add visual feedback here if needed
        console.log(`Zoom level: ${zoomLevel}`);
    }
    
    // Camera zoom methods
    zoomCamera(factor) {
        if (this.app.camera) {
            // Get current zoom level from slider
            const slider = document.getElementById('zoom-slider');
            let currentZoom = slider ? parseFloat(slider.value) : 50;

            // Apply zoom factor
            currentZoom *= factor;

            // Constrain to valid range
            currentZoom = Math.max(1, Math.min(100, currentZoom));

            // Update slider
            if (slider) {
                slider.value = currentZoom;
            }

            // Apply zoom to camera
            this.setCameraZoom(currentZoom);
        }
    }
    
    setCameraZoom(zoomLevel) {
        if (this.app.camera && this.app.cameraManager) {
            // Convert zoom level to camera position
            const zoomFactor = zoomLevel / 50; // 50 = neutral zoom
            this.app.cameraManager.setCameraZoom(zoomFactor);

            // Update the zoom display if needed
            this.updateZoomDisplay(zoomLevel);
        }
    }
    
    updateZoomDisplay(zoomLevel) {
        // You could add visual feedback here if needed
        console.log(`Zoom level: ${zoomLevel}`);
    }


    toggleCameraBorder(show) {
        const preview = document.getElementById('camera-border-preview');
        if (preview) {
            if (show) {
                preview.style.display = 'flex';
                this.updateCameraBorder();
            } else {
                preview.style.display = 'none';
            }
        }
    }

    updateCameraBorder() {
        const width = parseInt(document.getElementById('export-width')?.value || 1920);
        const height = parseInt(document.getElementById('export-height')?.value || 1080);
        const preview = document.getElementById('camera-border-preview');

        if (preview) {
            // Update preview dimensions
            const aspectRatio = width / height;
            const maxWidth = preview.parentElement.clientWidth;
            const maxHeight = 200;

            let displayWidth, displayHeight;
            if (aspectRatio > 1) {
                displayWidth = maxWidth;
                displayHeight = maxWidth / aspectRatio;
            } else {
                displayHeight = maxHeight;
                displayWidth = maxHeight * aspectRatio;
            }

            preview.style.width = `${displayWidth}px`;
            preview.style.height = `${displayHeight}px`;

            // Update preview content
            preview.innerHTML = `
                <div style="text-align: center; color: var(--text-secondary); font-size: 0.8rem;">
                    <div>Camera Border Preview</div>
                    <div style="margin-top: 8px; font-size: 0.7rem;">${width} × ${height}</div>
                    <div style="margin-top: 4px; font-size: 0.6rem;">Aspect Ratio: ${aspectRatio.toFixed(2)}</div>
                </div>
            `;

            // Re-add drag handle
            this.makeCameraBorderDraggable();
        }
    }

    updateCameraBorderFromDropdown() {
        const resolutionDropdown = document.getElementById('export-resolution');
        if (!resolutionDropdown) return;

        const selectedValue = resolutionDropdown.value;
        let width, height;

        if (selectedValue === 'custom') {
            // Show custom inputs if they exist
            const customGroup = document.getElementById('custom-resolution-group');
            if (customGroup) {
                customGroup.style.display = 'block';
            }
            // Use default values or existing custom values
            width = parseInt(document.getElementById('export-width')?.value || 1920);
            height = parseInt(document.getElementById('export-height')?.value || 1080);
        } else {
            // Hide custom inputs if they exist
            const customGroup = document.getElementById('custom-resolution-group');
            if (customGroup) {
                customGroup.style.display = 'none';
            }

            // Parse the selected resolution
            const parts = selectedValue.split('x');
            width = parseInt(parts[0]);
            height = parseInt(parts[1]);
        }

        // Update the camera border preview
        this.updateCameraBorderWithDimensions(width, height);
    }

    updateCameraBorderWithDimensions(width, height) {
        const preview = document.getElementById('camera-border-preview');

        if (preview) {
            // Update preview dimensions
            const aspectRatio = width / height;
            const maxWidth = preview.parentElement.clientWidth;
            const maxHeight = 200;

            let displayWidth, displayHeight;
            if (aspectRatio > 1) {
                displayWidth = maxWidth;
                displayHeight = maxWidth / aspectRatio;
            } else {
                displayHeight = maxHeight;
                displayWidth = maxHeight * aspectRatio;
            }

            preview.style.width = `${displayWidth}px`;
            preview.style.height = `${displayHeight}px`;

            // Update preview content
            preview.innerHTML = `
                <div style="text-align: center; color: var(--text-secondary); font-size: 0.8rem;">
                    <div>Camera Border Preview</div>
                    <div style="margin-top: 8px; font-size: 0.7rem;">${width} × ${height}</div>
                    <div style="margin-top: 4px; font-size: 0.6rem;">Aspect Ratio: ${aspectRatio.toFixed(2)}</div>
                </div>
            `;

            // Re-add drag handle
            this.makeCameraBorderDraggable();
        }
    }

    // --- UNIFIED SETTINGS MODAL ---
    openUnifiedSettingsModal(initialTab = 'general') {
        if (!this.unifiedSettingsInitialized) {
            this.initUnifiedSettingsModal();
            this.unifiedSettingsInitialized = true;
        }

        // Load current values before showing the modal.
        this.loadSettingsToUI();
        this.loadSceneSettingsToUI();
        this.updateSettingsRangeLabels();

        // Switch to the requested tab
        this.switchSettingsTab(initialTab);

        this.unifiedSettingsModal.classList.add('open');
    }

    closeUnifiedSettingsModal() {
        this.unifiedSettingsModal.classList.remove('open');
    }

    initUnifiedSettingsModal() {
        // Initialize unified settings modal
        this.unifiedSettingsModal = document.getElementById('unified-settings-modal');

        // Close button
        const closeBtn = document.getElementById('btn-settings-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeUnifiedSettingsModal());
        }

        // Reset button
        const resetBtn = document.getElementById('btn-settings-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetSettings();
                this.resetSceneSettings();
            });
        }

        // Save button
        const saveBtn = document.getElementById('btn-settings-save');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveSettings();
                this.applySceneSettings();
                this.closeUnifiedSettingsModal();
            });
        }

        // Keep slider value labels in sync.
        [
            ['setting-camera-speed', 'camera-speed-value'],
            ['setting-autosave-interval', 'autosave-interval-value'],
            ['setting-fog-near', 'fog-near-value'],
            ['setting-fog-far', 'fog-far-value'],
            ['setting-ambient-intensity', 'ambient-intensity-value']
        ].forEach(([inputId, labelId]) => {
            const input = document.getElementById(inputId);
            const label = document.getElementById(labelId);
            if (input && label) {
                input.addEventListener('input', () => { label.textContent = input.value; });
            }
        });

        // Tab buttons
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchSettingsTab(tab.dataset.tab);
            });
        });

        // Resolution dropdown change handler
        const resolutionDropdown = document.getElementById('setting-export-resolution');
        if (resolutionDropdown) {
            resolutionDropdown.addEventListener('change', (e) => {
                const customGroup = document.getElementById('custom-resolution-group');
                if (e.target.value === 'custom') {
                    customGroup.style.display = 'block';
                } else {
                    customGroup.style.display = 'none';
                }
            });
        }

        // Tutorial settings - wire up the start tutorial button in the tutorial tab
        const tutorialStartBtn = document.getElementById('startTutorialBtn');
        if (tutorialStartBtn) {
            tutorialStartBtn.addEventListener('click', () => {
                if (this.app.tutorialSystem) {
                    this.app.tutorialSystem.startTutorial('main');
                    this.closeUnifiedSettingsModal();
                }
            });
        }

        // Close on overlay click
        this.unifiedSettingsModal.addEventListener('click', (e) => {
            if (e.target.id === 'unified-settings-modal') this.closeUnifiedSettingsModal();
        });
    }

    switchSettingsTab(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.settings-tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Add active class to selected tab and content
        const activeTab = document.querySelector(`.settings-tab[data-tab="${tabName}"]`);
        const activeContent = document.querySelector(`.settings-tab-content[data-tab-content="${tabName}"]`);

        if (activeTab) activeTab.classList.add('active');
        if (activeContent) activeContent.classList.add('active');
    }
}