/**
 * Tutorial Configuration System
 *
 * This file defines the tutorial steps configuration and provides
 * an easy-to-use interface for setting up tutorials.
 */

class TutorialConfig {
    constructor() {
        // Default tutorial configuration
        this.tutorials = {
            'main': {
                enabled: true,
                steps: [
                    {
                        id: 'welcome',
                        elementId: 'canvas-container',
                        position: 'center',
                        arrowPosition: 'none', // No arrow for center position
                        arrowPositionOverride: 'center', // Arrow position along the side (center, top-third, middle-third, bottom-third)
                        marginOverride: '0',
                        heading: 'Welcome to Pixel AFrame!',
                        content: 'This quick tutorial will guide you through the main features of the 3D Staging Studio.',
                        showNext: true,
                        showSkip: true
                    },
                    {
                        id: 'tools',
                        elementId: 'tools-container',
                        position: 'left',
                        arrowPosition: 'right', // Arrow is on the right side of the tutorial panel, points right (towards target panel)
                        arrowPositionOverride: 'middle-third', // Arrow positioned in the middle third of the left side
                        marginOverride: '20px', // Additional margin for better spacing
                        heading: 'Tools Panel',
                        content: 'This panel contains all the tools for creating and manipulating 3D objects. You can add shapes, characters, lights, and more.',
                        showNext: true,
                        showSkip: true
                    },
                    {
                        id: 'layers',
                        elementId: 'layers-list',
                        position: 'right',
                        arrowPosition: 'left', // Arrow is on the left side of the tutorial panel, points left (away from tutorial panel)
                        arrowPositionOverride: 'top-third', // Arrow positioned in the top third of the right side
                        marginOverride: '60px', // Additional margin for better spacing
                        heading: 'Scene Objects',
                        content: 'Here you can see all the objects in your scene. Select objects to edit their properties or organize them into layers.',
                        showNext: true,
                        showSkip: true
                    },
                    {
                        id: 'properties',
                        elementId: 'props-content',
                        position: 'right',
                        arrowPosition: 'left', // Arrow is on the left side of the tutorial panel, points left (away from tutorial panel)
                        arrowPositionOverride: 'middle-third',
                        marginOverride: '60px', // Additional margin for better spacing
                        heading: 'Properties Panel',
                        content: 'When you select an object, its properties appear here. You can adjust position, rotation, scale, color, and other attributes.',
                        showNext: true,
                        showSkip: true
                    },
                    {
                        id: 'transform',
                        elementId: 'mode-translate',
                        position: 'bottom',
                        arrowPosition: 'top', // Arrow is on the top side of the tutorial panel, points up (towards target panel)
                        marginOverride: '30px', // Margin for transform controls positioning
                        heading: 'Transform Controls',
                        content: 'Use these tools to manipulate objects: Translate (G) to move, Rotate (R) to spin, Scale (S) to resize, and Hand (H) to navigate the scene.',
                        showNext: true,
                        showSkip: true
                    },
                    {
                        id: 'export',
                        elementId: 'btn-export',
                        position: 'top',
                        arrowPosition: 'bottom', // Arrow is on the bottom side of the tutorial panel, points down (towards target panel)
                        marginOverride: '25px', // Margin for export button positioning
                        heading: 'Export Your Scene',
                        content: 'When you\'re happy with your creation, use the Export button to save your scene as a JSON file or export as PNG image.',
                        showNext: true,
                        showSkip: true
                    }
                ]
            }
        };

        // Helpers used by the A-Frame lesson checks. These are functions so the
        // tutorial can re-check the live scene after every user action.
        const getEntities = (app) => app.aframeManager?.getAllEntities?.() || [];
        const getSelected = (app) => app.aframeManager?.getSelectedEntity?.();
        const hasTag = (app, tag) => getEntities(app).some(item =>
            item.element?.tagName?.toLowerCase() === tag
        );
        const tagCount = (app, tag) => getEntities(app).filter(item =>
            item.element?.tagName?.toLowerCase() === tag
        ).length;
        const hasSrc = (app, tag) => getEntities(app).some(item =>
            item.element?.tagName?.toLowerCase() === tag &&
            String(item.element.getAttribute('src') || '').trim().length > 0
        );
        const hasBehavior = (app) => getEntities(app).some(item =>
            item.element?.hasAttribute?.('studio-behavior')
        );
        const selectedIs = (app, tag) =>
            getSelected(app)?.tagName?.toLowerCase() === tag;

        // Lesson series based on the official A-Frame guides:
        // - building a basic scene
        // - building a 360 image gallery
        // - building a Minecraft-style demo
        this.tutorials['basic-scene'] = {
            enabled: true,
            title: 'Build a Basic Scene',
            description: 'Learn the core A-Frame building blocks: primitives, sky, light and properties.',
            steps: [
                {
                    id: 'basic-intro',
                    elementId: 'canvas-container',
                    position: 'center',
                    arrowPosition: 'none',
                    heading: 'Lesson 1: Build a Basic Scene',
                    content: 'This lesson follows the official A-Frame “Building a Basic Scene” guide. You will build directly in the visual editor, then export a working A-Frame page.',
                    showNext: true,
                    showSkip: true
                },
                {
                    id: 'basic-mode',
                    elementId: 'btn-aframe-mode',
                    position: 'bottom',
                    arrowPosition: 'top',
                    heading: 'Switch to A-Frame mode',
                    content: 'The A-Frame builder creates real <code>&lt;a-entity&gt;</code> elements. Click the <strong>A-Frame</strong> button in the header to open the builder.',
                    taskLabel: 'Switch to A-Frame mode',
                    task: (app) => !!app.aframeManager?.isAFrameMode,
                    showNext: true,
                    showSkip: true
                },
                {
                    id: 'basic-box',
                    elementId: 'tool-aframe-elements',
                    position: 'right',
                    arrowPosition: 'left',
                    marginOverride: '20px',
                    heading: 'Add a box',
                    content: 'Open the <strong>A-Frame Elements</strong> menu, then choose <strong>Primitives → Box</strong>. The new box appears in the scene and in the properties panel.',
                    taskLabel: 'Add an <a-box> to the scene',
                    task: (app) => hasTag(app, 'a-box'),
                    showNext: true,
                    showSkip: true
                },
                {
                    id: 'basic-sphere',
                    elementId: 'tool-aframe-elements',
                    position: 'right',
                    arrowPosition: 'left',
                    marginOverride: '20px',
                    heading: 'Add a sphere',
                    content: 'From the same menu choose <strong>Primitives → Sphere</strong>. A-Frame primitives are just entities with a geometry component and sensible defaults.',
                    taskLabel: 'Add an <a-sphere> to the scene',
                    task: (app) => hasTag(app, 'a-sphere'),
                    showNext: true,
                    showSkip: true
                },
                {
                    id: 'basic-plane',
                    elementId: 'tool-aframe-elements',
                    position: 'right',
                    arrowPosition: 'left',
                    marginOverride: '20px',
                    heading: 'Add a ground plane',
                    content: 'Add a <strong>Plane</strong> for the floor. Planes are useful for ground, walls and picture frames.',
                    taskLabel: 'Add an <a-plane> to the scene',
                    task: (app) => hasTag(app, 'a-plane'),
                    showNext: true,
                    showSkip: true
                },
                {
                    id: 'basic-sky',
                    elementId: 'tool-aframe-elements',
                    position: 'right',
                    arrowPosition: 'left',
                    marginOverride: '20px',
                    heading: 'Add a sky',
                    content: 'Add a <strong>Sky</strong> so the scene has a background. You can change its colour or later use a panoramic image as its source.',
                    taskLabel: 'Add an <a-sky>',
                    task: (app) => hasTag(app, 'a-sky'),
                    showNext: true,
                    showSkip: true
                },
                {
                    id: 'basic-properties',
                    elementId: 'props-content',
                    position: 'left',
                    arrowPosition: 'right',
                    marginOverride: '20px',
                    heading: 'Edit an object',
                    content: 'Select the box in the Scene Objects list. In <strong>Properties</strong> you can change position, rotation, scale, colour and material without writing code.',
                    taskLabel: 'Select an <a-box>',
                    task: (app) => selectedIs(app, 'a-box'),
                    showNext: true,
                    showSkip: true
                },
                {
                    id: 'basic-light',
                    elementId: 'tool-aframe-elements',
                    position: 'right',
                    arrowPosition: 'left',
                    marginOverride: '20px',
                    heading: 'Add a light',
                    content: 'Add a <strong>Light</strong> from the Environment section. Lights make the 3D shapes readable.',
                    taskLabel: 'Add an <a-light>',
                    task: (app) => hasTag(app, 'a-light'),
                    showNext: true,
                    showSkip: true
                },
                {
                    id: 'basic-finish',
                    elementId: 'btn-export',
                    position: 'bottom',
                    arrowPosition: 'top',
                    heading: 'Preview and export',
                    content: 'Use <strong>VR</strong> to preview (F5), then <strong>Export ZIP</strong> to download a standalone A-Frame site. You built a scene with a box, sphere, plane, sky and light — the same elements from the official guide.',
                    taskLabel: 'Click Next when you are ready',
                    task: () => true,
                    showNext: true,
                    showSkip: true
                }
            ]
        };

        this.tutorials['image-gallery'] = {
            enabled: true,
            title: 'Build a 360 Image Gallery',
            description: 'Create a panoramic sky, image thumbnails and clickable image-swapping behaviour.',
            steps: [
                {
                    id: 'gallery-intro',
                    elementId: 'canvas-container',
                    position: 'center',
                    arrowPosition: 'none',
                    heading: 'Lesson 2: 360 Image Gallery',
                    content: 'This lesson follows the A-Frame 360 image gallery guide: a panoramic sky, image thumbnails, and clicks that change the panorama.',
                    showNext: true,
                    showSkip: true
                },
                {
                    id: 'gallery-mode',
                    elementId: 'btn-aframe-mode',
                    position: 'bottom',
                    arrowPosition: 'top',
                    heading: 'Open the A-Frame builder',
                    content: 'Switch to <strong>A-Frame mode</strong> so you can work with real A-Frame elements.',
                    taskLabel: 'Switch to A-Frame mode',
                    task: (app) => !!app.aframeManager?.isAFrameMode,
                    showNext: true,
                    showSkip: true
                },
                {
                    id: 'gallery-sky',
                    elementId: 'tool-aframe-elements',
                    position: 'right',
                    arrowPosition: 'left',
                    marginOverride: '20px',
                    heading: 'Add a panoramic sky',
                    content: 'Add <strong>Media → 360 Panorama / Sky</strong>, then select it and give it a source image URL (or choose a file). This becomes the first 360° panorama.',
                    taskLabel: 'Add a sky with an image source',
                    task: (app) => hasSrc(app, 'a-sky'),
                    showNext: true,
                    showSkip: true
                },
                {
                    id: 'gallery-image',
                    elementId: 'tool-aframe-elements',
                    position: 'right',
                    arrowPosition: 'left',
                    marginOverride: '20px',
                    heading: 'Add a thumbnail image',
                    content: 'Add <strong>Media → Image</strong> and give it a picture. In the guide the image is the clickable thumbnail that changes the sky.',
                    taskLabel: 'Add an <a-image> with a source',
                    task: (app) => hasSrc(app, 'a-image'),
                    showNext: true,
                    showSkip: true
                },
                {
                    id: 'gallery-behavior',
                    elementId: 'props-content',
                    position: 'left',
                    arrowPosition: 'right',
                    marginOverride: '20px',
                    heading: 'Add the click behaviour',
                    content: 'Select the thumbnail, then use <strong>Behaviours / Triggers</strong>. Add: trigger <strong>On click</strong>, action <strong>Swap image</strong>, target <strong>#sky-id</strong>, and a second panorama URL. Give the sky an ID first if needed.',
                    taskLabel: 'Add a behaviour to any element',
                    task: (app) => hasBehavior(app),
                    showNext: true,
                    showSkip: true
                },
                {
                    id: 'gallery-finish',
                    elementId: 'btn-enter-vr',
                    position: 'bottom',
                    arrowPosition: 'top',
                    heading: 'Try the gallery in VR',
                    content: 'Click <strong>VR</strong> to preview. Look around the panorama and click the thumbnail to swap images. Export the ZIP when you are happy with it.',
                    taskLabel: 'Click Next when you are ready',
                    task: () => true,
                    showNext: true,
                    showSkip: true
                }
            ]
        };

        this.tutorials['minecraft-demo'] = {
            enabled: true,
            title: 'Build a Minecraft-style World',
            description: 'Build a blocky world with a ground plane, boxes, sky and a clickable block.',
            steps: [
                {
                    id: 'minecraft-intro',
                    elementId: 'canvas-container',
                    position: 'center',
                    arrowPosition: 'none',
                    heading: 'Lesson 3: Minecraft-style World',
                    content: 'This lesson follows the A-Frame Minecraft demo guide. You will create a blocky world using boxes and a ground plane, then add interaction.',
                    showNext: true,
                    showSkip: true
                },
                {
                    id: 'minecraft-mode',
                    elementId: 'btn-aframe-mode',
                    position: 'bottom',
                    arrowPosition: 'top',
                    heading: 'Open the A-Frame builder',
                    content: 'Switch to <strong>A-Frame mode</strong>. Everything you add from now on is a real A-Frame entity.',
                    taskLabel: 'Switch to A-Frame mode',
                    task: (app) => !!app.aframeManager?.isAFrameMode,
                    showNext: true,
                    showSkip: true
                },
                {
                    id: 'minecraft-ground',
                    elementId: 'tool-aframe-elements',
                    position: 'right',
                    arrowPosition: 'left',
                    marginOverride: '20px',
                    heading: 'Create the ground',
                    content: 'Add a <strong>Plane</strong>. Select it and use Properties to make it large, for example scale <code>10 10 10</code> or width/height values.',
                    taskLabel: 'Add a ground plane',
                    task: (app) => hasTag(app, 'a-plane'),
                    showNext: true,
                    showSkip: true
                },
                {
                    id: 'minecraft-blocks',
                    elementId: 'tool-aframe-elements',
                    position: 'right',
                    arrowPosition: 'left',
                    marginOverride: '20px',
                    heading: 'Place three blocks',
                    content: 'Add three <strong>Boxes</strong>. Move them with the Position fields so they form a small blocky structure.',
                    taskLabel: 'Add at least 3 boxes',
                    task: (app) => tagCount(app, 'a-box') >= 3,
                    showNext: true,
                    showSkip: true
                },
                {
                    id: 'minecraft-sky',
                    elementId: 'tool-aframe-elements',
                    position: 'right',
                    arrowPosition: 'left',
                    marginOverride: '20px',
                    heading: 'Add a sky',
                    content: 'Add a <strong>Sky</strong> and change its colour in Properties. This is the same sky element used in the official demo.',
                    taskLabel: 'Add an <a-sky>',
                    task: (app) => hasTag(app, 'a-sky'),
                    showNext: true,
                    showSkip: true
                },
                {
                    id: 'minecraft-interaction',
                    elementId: 'props-content',
                    position: 'left',
                    arrowPosition: 'right',
                    marginOverride: '20px',
                    heading: 'Make a block interactive',
                    content: 'Select one box. Add a <strong>Behaviour</strong>: on click → <strong>Toggle visibility</strong>. Now the block can disappear and reappear when clicked.',
                    taskLabel: 'Add a click behaviour',
                    task: (app) => hasBehavior(app),
                    showNext: true,
                    showSkip: true
                },
                {
                    id: 'minecraft-finish',
                    elementId: 'btn-enter-vr',
                    position: 'bottom',
                    arrowPosition: 'top',
                    heading: 'Explore your world',
                    content: 'Enter VR to explore the blocky scene, or export the project as a standalone A-Frame site. You have now completed all three starter lessons.',
                    taskLabel: 'Click Next when you are ready',
                    task: () => true,
                    showNext: true,
                    showSkip: true
                }
            ]
        };

        // Current tutorial state
        this.currentTutorial = 'main';
        this.currentStep = 0;
        this.isActive = false;
    }

    /**
     * Add a new tutorial
     * @param {string} tutorialId - Unique identifier for the tutorial
     * @param {Object} config - Tutorial configuration
     */
    addTutorial(tutorialId, config) {
        this.tutorials[tutorialId] = config;
    }

    /**
     * Get tutorial by ID
     * @param {string} tutorialId - Tutorial identifier
     * @returns {Object|null} Tutorial configuration or null if not found
     */
    getTutorial(tutorialId) {
        return this.tutorials[tutorialId] || null;
    }

    /**
     * Get current step in current tutorial
     * @returns {Object|null} Current step or null if no active tutorial
     */
    getCurrentStep() {
        const tutorial = this.getTutorial(this.currentTutorial);
        if (!tutorial || !tutorial.steps || this.currentStep >= tutorial.steps.length) {
            return null;
        }
        return tutorial.steps[this.currentStep];
    }

    /**
     * Move to next step
     * @returns {Object|null} Next step or null if tutorial is complete
     */
    nextStep() {
        const tutorial = this.getTutorial(this.currentTutorial);
        if (!tutorial || !tutorial.steps) return null;

        this.currentStep++;
        if (this.currentStep >= tutorial.steps.length) {
            // Tutorial complete
            return null;
        }
        return this.getCurrentStep();
    }

    /**
     * Move to previous step
     * @returns {Object|null} Previous step or null if at beginning
     */
    prevStep() {
        if (this.currentStep <= 0) return null;
        this.currentStep--;
        return this.getCurrentStep();
    }

    /**
     * Reset tutorial to first step
     */
    resetTutorial() {
        this.currentStep = 0;
    }

    /**
     * Start a specific tutorial
     * @param {string} tutorialId - Tutorial to start
     */
    startTutorial(tutorialId) {
        if (this.tutorials[tutorialId]) {
            this.currentTutorial = tutorialId;
            this.currentStep = 0;
            this.isActive = true;
        }
    }

    /**
     * Stop current tutorial
     */
    stopTutorial() {
        this.isActive = false;
    }

    /**
     * Check if tutorial is active
     * @returns {boolean} True if tutorial is active
     */
    isTutorialActive() {
        return this.isActive;
    }

    /**
     * Get position class for tutorial step
     * @param {string} position - Position value from step config
     * @returns {string} CSS class for positioning
     */
    getPositionClass(position) {
        switch(position) {
            case 'top': return 'tutorial-top';
            case 'bottom': return 'tutorial-bottom';
            case 'left': return 'tutorial-left';
            case 'right': return 'tutorial-right';
            case 'center': return 'tutorial-center';
            default: return 'tutorial-right';
        }
    }
}

// Export for use in other modules
export { TutorialConfig };
const tutorialConfig = new TutorialConfig();