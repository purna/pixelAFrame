/**
 * A-Frame Basics — an 8-session guided course for the Pixel A-Frame builder.
 *
 * Each session is a list of small tasks. A task is a function that inspects
 * the live app state, so the tutorial panel can tick them off automatically as
 * the student builds. The same data also powers the session tabs.
 */

const tagOf = (element) => (element?.tagName || '').toLowerCase();

const entities = (app) =>
    (app.aframeManager?.getAllEntities?.() || [])
        .map((record) => record.element)
        .filter(Boolean);

const hasTag = (app, tag) => entities(app).some((el) => tagOf(el) === tag);

const countTag = (app, tag) => entities(app).filter((el) => tagOf(el) === tag).length;

const selected = (app) => app.aframeManager?.getSelectedEntity?.() || null;

const selectedIs = (app, tag) => tagOf(selected(app)) === tag;

const hasComponent = (app, component) =>
    entities(app).some((el) => el.hasAttribute?.(component));

const selectedHasComponent = (app, component) =>
    !!selected(app)?.hasAttribute?.(component);

const scene = () => document.getElementById('aframe-scene');

const globalsEnabled = (app, name) => !!app.globalsSystem?.isEnabled?.(name);

const toVec = (value, fallback = [0, 0, 0]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return [Number(value.x) || 0, Number(value.y) || 0, Number(value.z) || 0];
    }
    if (Array.isArray(value)) {
        return value.map((part) => Number(part) || 0);
    }
    const parts = String(value ?? '').trim().split(/\s+/).map(Number);
    return [0, 1, 2].map((index) => (Number.isFinite(parts[index]) ? parts[index] : fallback[index]));
};

const vecChanged = (element, attribute, fallback) => {
    if (!element) return false;
    const current = toVec(element.getAttribute?.(attribute), fallback);
    return current.some((value, index) => Math.abs(value - fallback[index]) > 0.001);
};

// Default placement the factory uses when a primitive is added.
const spawnPosition = {
    'a-box': [0, 0.5, -3],
    'a-sphere': [0, 1, -3],
    'a-cylinder': [0, 0.75, -3],
    'a-cone': [0, 0.75, -3],
    'a-plane': [0, 0, -3],
    'a-torus': [0, 1, -3],
    'a-torus-knot': [0, 1, -3],
    'a-text': [0, 1.5, -3],
    'a-image': [0, 1, -3],
    'a-gltf-model': [0, 0, -3],
    'a-light': [0, 1, -3]
};

const movedFromSpawn = (element) => {
    if (!element) return false;
    const fallback = spawnPosition[tagOf(element)] || [0, 1, -3];
    return vecChanged(element, 'position', fallback);
};

const materialData = (element) => {
    if (!element) return {};
    const live = element.components?.material?.data;
    if (live) return live;
    const raw = element.getAttribute?.('material');
    if (raw && typeof raw === 'object') return raw;
    if (typeof raw === 'string') {
        return raw.split(';').reduce((acc, part) => {
            const [key, value] = part.split(':');
            if (key && value) acc[key.trim()] = value.trim();
            return acc;
        }, {});
    }
    return {};
};

const normalizeColor = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value.trim().toLowerCase();
    if (typeof value.getHexString === 'function') return '#' + value.getHexString().toLowerCase();
    return '';
};

const spawnColor = {
    'a-box': '#4cc3d9',
    'a-sphere': '#ef2d5e',
    'a-cylinder': '#ffc65d',
    'a-cone': '#7bc8a4',
    'a-plane': '#333333',
    'a-torus': '#4cc3d9',
    'a-torus-knot': '#ef2d5e',
    'a-circle': '#ffc65d',
    'a-ring': '#7bc8a4',
    'a-text': '#ffffff',
    'a-sky': '#1a1a2e'
};

const elementColor = (element) => {
    const material = materialData(element);
    return normalizeColor(material.color) || normalizeColor(element?.getAttribute?.('color'));
};

const selectedColorChanged = (app) => {
    const element = selected(app);
    if (!element) return false;
    const current = elementColor(element);
    const original = spawnColor[tagOf(element)];
    if (!current) return false;
    if (!original) return current !== '';
    return current !== original;
};

const materialNumber = (element, key, fallback) => {
    const value = Number(materialData(element)[key]);
    return Number.isFinite(value) ? value : fallback;
};

const textureSource = (element) => {
    if (!element) return '';
    const candidates = [
        element.components?.material?.attrValue?.src,
        materialData(element).src,
        element.getAttribute?.('src')
    ];
    return candidates.find((value) => typeof value === 'string' && value.startsWith('#')) || '';
};

const hasTexture = (app) => entities(app).some((element) => !!textureSource(element));

const hasSound = (app) => entities(app).some((element) =>
    element.hasAttribute?.('sound') || tagOf(element) === 'a-sound'
);

const hasMeaningfulId = (element) => {
    if (!element?.id) return false;
    // Factory-generated ids look like box-1760000000000-abc.
    return !/-\d{10,}(?:-[a-z0-9]+)?$/i.test(element.id);
};

const hasBehaviour = (element) => {
    if (!element) return false;
    const applied = (element.dataset?.studioBehaviors || '').trim();
    if (applied && applied !== '[]') return true;
    return !!element.getAttribute?.('studio-behavior');
};

const hasCustomAction = (element) => {
    const raw = element?.getAttribute?.('studio-behavior');
    if (!raw) return false;
    if (typeof raw === 'object' && raw.actions) {
        try {
            return JSON.parse(raw.actions).length > 0;
        } catch (err) {
            return false;
        }
    }
    return true;
};

const exportDialogOpen = () => {
    const modal = document.getElementById('export-modal');
    return !!modal && modal.classList.contains('open');
};

const projectSaved = () => localStorage.getItem('pixelAFrame-scene') !== null;

const task = (label, check) => ({ taskLabel: label, task: check });

const recap = (id, heading, content) => ({
    id,
    heading,
    content,
    taskLabel: 'Session complete — review and move on',
    task: () => true
});

export function createAFrameCourse() {
    return {
        id: 'aframe-basics',
        title: 'A-Frame Basics',
        subtitle: '8 sessions · build a VR-ready scene from scratch',
        sessions: [
            {
                id: 'session-1',
                title: 'Session 1 — Meet the Builder',
                icon: 'fa-vr-cardboard',
                description: 'Switch into the A-Frame builder and assemble your first complete scene.',
                steps: [
                    {
                        id: 's1-mode',
                        elementId: 'btn-aframe-mode',
                        heading: 'Open the A-Frame builder',
                        content: 'The editor has two worlds. Three.js mode is for quick mock-ups; <strong>A-Frame mode</strong> writes real <code>&lt;a-scene&gt;</code> elements you can export as a website. Click <strong>A-Frame</strong> in the top bar (or press <strong>F6</strong>).',
                        ...task('Switch to A-Frame mode', (app) => !!app.aframeManager?.isAFrameMode)
                    },
                    {
                        id: 's1-box',
                        elementId: 'tool-aframe-elements',
                        heading: 'Add your first primitive',
                        content: 'Open the <strong>A-Frame Elements</strong> menu (the VR headset icon), then choose <strong>Primitives → Box</strong>. The box is an <code>&lt;a-box&gt;</code> with sensible defaults.',
                        ...task('Add an <a-box> to the scene', (app) => hasTag(app, 'a-box'))
                    },
                    {
                        id: 's1-plane',
                        elementId: 'tool-aframe-elements',
                        heading: 'Give the scene a floor',
                        content: 'Add <strong>Primitives → Plane</strong>. Planes are rotated flat by default and make a good ground, wall or photo frame.',
                        ...task('Add an <a-plane>', (app) => hasTag(app, 'a-plane'))
                    },
                    {
                        id: 's1-sky',
                        elementId: 'tool-aframe-elements',
                        heading: 'Wrap the world in a sky',
                        content: 'Add <strong>Media → 360 Panorama / Sky</strong>. Change its colour in Properties, or give it a panoramic image source later in Session 5.',
                        ...task('Add an <a-sky>', (app) => hasTag(app, 'a-sky'))
                    },
                    {
                        id: 's1-light',
                        elementId: 'tool-aframe-elements',
                        heading: 'Light the scene',
                        content: 'Add <strong>Environment → Light</strong>. A-Frame mixes ambient and directional lights to make shapes readable in 3D and in VR.',
                        ...task('Add an <a-light>', (app) => hasTag(app, 'a-light'))
                    },
                    {
                        id: 's1-select',
                        elementId: 'layers-list',
                        heading: 'Select an object',
                        content: 'Click an object in the viewport or in <strong>Scene Objects</strong>. Its properties appear on the right; this is where every later lesson happens.',
                        ...task('Select an A-Frame element', (app) => !!selected(app))
                    },
                    recap('s1-recap', 'Session 1 complete',
                        'You have a floor, a box, a sky and a light — the same structure as the official “Building a Basic Scene” guide. Keep the scene; Session 2 adds more shapes.')
                ]
            },
            {
                id: 'session-2',
                title: 'Session 2 — Shapes & Text',
                icon: 'fa-shapes',
                description: 'Use the built-in primitives and edit their geometry values.',
                steps: [
                    {
                        id: 's2-sphere',
                        elementId: 'tool-aframe-elements',
                        heading: 'Add a sphere',
                        content: 'Choose <strong>Primitives → Sphere</strong>. Primitives combine a geometry component with a material, so they are the fastest way to block out a scene.',
                        ...task('Add an <a-sphere>', (app) => hasTag(app, 'a-sphere'))
                    },
                    {
                        id: 's2-cylinder',
                        elementId: 'tool-aframe-elements',
                        heading: 'Add a cylinder',
                        content: 'Add <strong>Primitives → Cylinder</strong>. Cylinders are great for pillars, tree trunks and barrels.',
                        ...task('Add an <a-cylinder>', (app) => hasTag(app, 'a-cylinder'))
                    },
                    {
                        id: 's2-cone',
                        elementId: 'tool-aframe-elements',
                        heading: 'Add a cone',
                        content: 'Add <strong>Primitives → Cone</strong>. Cones work for roofs, rockets and trees.',
                        ...task('Add an <a-cone>', (app) => hasTag(app, 'a-cone'))
                    },
                    {
                        id: 's2-text',
                        elementId: 'tool-aframe-elements',
                        heading: 'Add 3D text',
                        content: 'Add <strong>Text &amp; UI → Text</strong>, then select it and change its <strong>value</strong> in Properties to a word or your name.',
                        ...task('Add an <a-text> with a value', (app) => entities(app).some((el) =>
                            tagOf(el) === 'a-text' && String(el.getAttribute('value') || '').trim().length > 0
                        ))
                    },
                    {
                        id: 's2-geometry',
                        elementId: 'props-content',
                        heading: 'Resize via geometry',
                        content: 'Select the sphere and change its <strong>radius</strong> (or use Scale). Geometry values change the mesh itself; scale changes the whole entity including its children.',
                        ...task('Change the sphere radius', (app) => entities(app).some((el) =>
                            tagOf(el) === 'a-sphere' && Math.abs(Number(el.getAttribute('radius') || 0.5) - 0.5) > 0.001
                        ))
                    },
                    {
                        id: 's2-id',
                        elementId: 'props-content',
                        heading: 'Name an element',
                        content: 'Give an important element a readable <strong>Element ID</strong> such as <code>player-box</code>. IDs are how behaviours and export code refer to objects later.',
                        ...task('Give the selected element a real ID', (app) => hasMeaningfulId(selected(app)))
                    },
                    recap('s2-recap', 'Session 2 complete',
                        'You now know the primitive library, geometry properties and why IDs matter. Next: moving objects around in 3D space.')
                ]
            },
            {
                id: 'session-3',
                title: 'Session 3 — Move, Rotate, Scale',
                icon: 'fa-arrows-alt',
                description: 'Master position, rotation and scale with the transform tools.',
                steps: [
                    {
                        id: 's3-select-box',
                        elementId: 'tool-aframe-elements',
                        heading: 'Start with a box',
                        content: 'Add a fresh <strong>Box</strong> (or select your existing one). Keep it selected — the next three tasks all edit the selected element.',
                        ...task('Select an <a-box>', (app) => selectedIs(app, 'a-box'))
                    },
                    {
                        id: 's3-move',
                        elementId: 'props-content',
                        heading: 'Move it',
                        content: 'Change <strong>Position</strong> in Properties, or press <strong>G</strong> and drag the arrows in the viewport. X is left/right, Y is up/down, Z is towards/away from the camera.',
                        ...task('Move the selected box', (app) => selectedIs(app, 'a-box') && movedFromSpawn(selected(app)))
                    },
                    {
                        id: 's3-rotate',
                        elementId: 'props-content',
                        heading: 'Rotate it',
                        content: 'Change <strong>Rotation</strong> (degrees) or press <strong>R</strong>. Rotation order is X, Y, Z.',
                        ...task('Rotate the selected box', (app) => selectedIs(app, 'a-box') && vecChanged(selected(app), 'rotation', [0, 0, 0]))
                    },
                    {
                        id: 's3-scale',
                        elementId: 'props-content',
                        heading: 'Scale it',
                        content: 'Change <strong>Scale</strong> or press <strong>S</strong>. A scale of 2 doubles the size on that axis; negative values mirror the object.',
                        ...task('Scale the selected box', (app) => selectedIs(app, 'a-box') && vecChanged(selected(app), 'scale', [1, 1, 1]))
                    },
                    {
                        id: 's3-transform-tools',
                        elementId: 'mode-translate',
                        heading: 'Try the transform gizmos',
                        content: 'Use the floating toolbar: <strong>Hand (H)</strong> to orbit, <strong>Translate (G)</strong>, <strong>Rotate (R)</strong> and <strong>Scale (S)</strong>. The Local toggle switches between world and object axes.',
                        ...task('Switch to the Rotate or Scale gizmo', (app) => {
                            const mode = app.transformControl?.getMode?.() || app.transformControl?.mode;
                            return mode === 'rotate' || mode === 'scale';
                        })
                    },
                    recap('s3-recap', 'Session 3 complete',
                        'Position, rotation and scale are the three transform components every A-Frame entity has. You can edit them numerically or with gizmos.')
                ]
            },
            {
                id: 'session-4',
                title: 'Session 4 — Light & Atmosphere',
                icon: 'fa-lightbulb',
                description: 'Shape the mood with lights, fog, background and sky colour.',
                steps: [
                    {
                        id: 's4-light',
                        elementId: 'tool-aframe-elements',
                        heading: 'Place a light',
                        content: 'Add another <strong>Light</strong> from Environment, then move it above the scene (Position Y around 3–5). Light position matters: it defines highlights and shadows.',
                        ...task('Place a light above the scene', (app) => entities(app).some((el) =>
                            tagOf(el) === 'a-light' && toVec(el.getAttribute('position'), [0, 1, -3])[1] >= 2
                        ))
                    },
                    {
                        id: 's4-sky',
                        elementId: 'layers-list',
                        heading: 'Tint the sky',
                        content: 'Select your <code>&lt;a-sky&gt;</code> and change its colour, or click empty space and use the <strong>Sky / Skybox</strong> colour in Scene settings.',
                        ...task('Change the sky colour', (app) => entities(app).some((el) =>
                            tagOf(el) === 'a-sky' && elementColor(el) !== '#1a1a2e'
                        ))
                    },
                    {
                        id: 's4-background',
                        elementId: 'props-content',
                        heading: 'Set a world background',
                        content: 'Deselect everything (click empty space) to open <strong>Scene / World</strong>. Change the <strong>World → Background</strong> colour or pick an environment preset like <em>forest</em> or <em>starry</em>.',
                        ...task('Apply a world background or environment', (app) =>
                            globalsEnabled(app, 'background') || globalsEnabled(app, 'environment'))
                    },
                    {
                        id: 's4-fog',
                        elementId: 'props-content',
                        heading: 'Add depth with fog',
                        content: 'In the same Scene / World panel, tick <strong>Fog</strong>. Fog fades distant geometry and instantly makes a scene feel larger.',
                        ...task('Enable fog on the scene', (app) => globalsEnabled(app, 'fog'))
                    },
                    {
                        id: 's4-shadows',
                        elementId: 'props-content',
                        heading: 'Enable shadows',
                        content: 'Tick <strong>Shadows</strong> in Scene / World. Every light gets <code>shadow: cast</code>; objects then need <code>shadow: receive</code> (add it via Components if a surface stays flat).',
                        ...task('Enable scene shadows', (app) => globalsEnabled(app, 'shadow'))
                    },
                    recap('s4-recap', 'Session 4 complete',
                        'Lighting, sky, background and fog are scene-level tools. Small changes here have the biggest impact on how “finished” a scene looks.')
                ]
            },
            {
                id: 'session-5',
                title: 'Session 5 — Materials & Textures',
                icon: 'fa-palette',
                description: 'Colour, metalness, roughness and image textures.',
                steps: [
                    {
                        id: 's5-select',
                        elementId: 'layers-list',
                        heading: 'Select a surface',
                        content: 'Select any primitive you want to re-surface. The <strong>Material</strong> section in Properties controls colour, metalness and roughness.',
                        ...task('Select an element to materialise', (app) => !!selected(app))
                    },
                    {
                        id: 's5-colour',
                        elementId: 'props-content',
                        heading: 'Change the colour',
                        content: 'Pick a new colour in the <strong>Material → Color</strong> swatch. This writes <code>material="color: …"</code> on the element.',
                        ...task('Change the material colour', (app) => selectedColorChanged(app))
                    },
                    {
                        id: 's5-metal',
                        elementId: 'props-content',
                        heading: 'Make it metallic',
                        content: 'Raise <strong>Metalness</strong> towards 1.0 for a metal look. It is most convincing with environment lighting or a texture.',
                        ...task('Set metalness to 0.6 or higher', (app) => {
                            const element = selected(app);
                            return !!element && materialNumber(element, 'metalness', 0.5) >= 0.6;
                        })
                    },
                    {
                        id: 's5-rough',
                        elementId: 'props-content',
                        heading: 'Make it glossy',
                        content: 'Lower <strong>Roughness</strong> towards 0 for a shiny, reflective surface. High roughness looks matte.',
                        ...task('Set roughness to 0.25 or lower', (app) => {
                            const element = selected(app);
                            return !!element && materialNumber(element, 'roughness', 0.5) <= 0.25;
                        })
                    },
                    {
                        id: 's5-texture',
                        elementId: 'tool-assets',
                        heading: 'Apply a texture',
                        content: 'Open <strong>Assets</strong> (photo icon) → <strong>Textures</strong>. Select your surface, then use the <strong>check</strong> button on a texture row to apply it. Image textures can be added from a URL or a file.',
                        ...task('Apply an image texture from the Asset Library', (app) => hasTexture(app))
                    },
                    recap('s5-recap', 'Session 5 complete',
                        'Materials are reusable descriptions of a surface. Colour, metalness and roughness are the three values to tune first; textures add detail.')
                ]
            },
            {
                id: 'session-6',
                title: 'Session 6 — Assets & 3D Models',
                icon: 'fa-cubes',
                description: 'Place models, images, sounds and preview GLB files.',
                steps: [
                    {
                        id: 's6-model',
                        elementId: 'tool-assets',
                        heading: 'Place a GLB model',
                        content: 'Open <strong>Assets → Models</strong> and press the <strong>+</strong> button on a model (or use A-Frame Elements → Assets → Preloaded). The library ships with Xbot, Ybot, trees, a table and an engine.',
                        ...task('Add an <a-gltf-model> to the scene', (app) => hasTag(app, 'a-gltf-model'))
                    },
                    {
                        id: 's6-scale',
                        elementId: 'props-content',
                        heading: 'Frame the model',
                        content: 'Select the model and adjust <strong>Position</strong>, <strong>Rotation</strong> and <strong>Scale</strong> until it sits naturally in the scene.',
                        ...task('Move or scale the model', (app) => entities(app).some((el) =>
                            tagOf(el) === 'a-gltf-model' &&
                            (vecChanged(el, 'scale', [1, 1, 1]) || movedFromSpawn(el))
                        ))
                    },
                    {
                        id: 's6-image',
                        elementId: 'tool-assets',
                        heading: 'Place a texture or photo',
                        content: 'From <strong>Assets → Textures</strong>, press <strong>+</strong> to place an image in the scene. Images are <code>&lt;a-image&gt;</code> entities (great for signs and portraits).',
                        ...task('Add an <a-image>', (app) => hasTag(app, 'a-image'))
                    },
                    {
                        id: 's6-audio',
                        elementId: 'tool-assets',
                        heading: 'Add a sound',
                        content: 'From <strong>Assets → Audio</strong>, place a sound (or add <strong>Media → Audio</strong>). Select it to set volume, loop and autoplay in Properties.',
                        ...task('Add a sound to the scene', (app) => hasSound(app))
                    },
                    {
                        id: 's6-preview',
                        elementId: 'tool-assets',
                        heading: 'Preview a model',
                        content: 'In <strong>Assets → Models</strong>, press the <strong>eye</strong> button on a model. A rotating 3D preview loads the GLB so you can inspect it before placing it.',
                        ...task('Open a 3D asset preview', () => !!document.querySelector('.asset-preview-modal'))
                    },
                    recap('s6-recap', 'Session 6 complete',
                        'The Asset Library is the single source for images, video, audio and GLB models. Every asset is written into <code>&lt;a-assets&gt;</code> so exports stay self-contained.')
                ]
            },
            {
                id: 'session-7',
                title: 'Session 7 — Interaction',
                icon: 'fa-hand-pointer',
                description: 'Add a cursor, behaviours and custom click actions.',
                steps: [
                    {
                        id: 's7-cursor',
                        elementId: 'tool-aframe-elements',
                        heading: 'Add a gaze cursor',
                        content: 'Add <strong>Text &amp; UI → Cursor</strong>. A cursor with a raycaster lets users click objects by looking at them — essential for headsets.',
                        ...task('Add an element with a cursor component', (app) => hasComponent(app, 'cursor'))
                    },
                    {
                        id: 's7-id',
                        elementId: 'props-content',
                        heading: 'Give the target an ID',
                        content: 'Select the object that should react and set a readable <strong>Element ID</strong> (for example <code>magic-box</code>). Behaviours and other elements refer to it by <code>#magic-box</code>.',
                        ...task('Give the selected element a real ID', (app) => hasMeaningfulId(selected(app)))
                    },
                    {
                        id: 's7-behaviour',
                        elementId: 'props-content',
                        heading: 'Add a curated behaviour',
                        content: 'With the target selected, scroll to <strong>Behaviours</strong> and add one, e.g. <strong>Toggle Visible</strong> or <strong>Highlight</strong>. Behaviours build the click logic for you.',
                        ...task('Add a behaviour to the selected element', (app) => hasBehaviour(selected(app)))
                    },
                    {
                        id: 's7-action',
                        elementId: 'props-content',
                        heading: 'Add a custom action',
                        content: 'Open <strong>Advanced custom actions</strong>, choose a trigger and action (for example <em>On click → Popup message</em>), optionally set a target and value, then press <strong>Add Action</strong>.',
                        ...task('Add a custom action', (app) => hasCustomAction(selected(app)))
                    },
                    {
                        id: 's7-controls',
                        elementId: 'tool-aframe-elements',
                        heading: 'Add movement controls',
                        content: 'Add <strong>Camera &amp; Controls → WASD Controls</strong> (or Look Controls). WASD movement makes a desktop scene feel like a game.',
                        ...task('Add WASD or Look controls', (app) =>
                            hasComponent(app, 'wasd-controls') || hasComponent(app, 'look-controls'))
                    },
                    recap('s7-recap', 'Session 7 complete',
                        'Cursor + raycaster + behaviours turn a static scene into an experience. Test by entering VR mode or clicking objects in the viewport.')
                ]
            },
            {
                id: 'session-8',
                title: 'Session 8 — Camera & Publishing',
                icon: 'fa-download',
                description: 'Cameras, saving, previewing and exporting a standalone site.',
                steps: [
                    {
                        id: 's8-camera',
                        elementId: 'tool-aframe-elements',
                        heading: 'Add a camera',
                        content: 'Add <strong>Camera &amp; Controls → Camera</strong>. A scene exports with its rig; extra cameras are useful for cutaways and camera switching.',
                        ...task('Add a camera entity', (app) => hasComponent(app, 'camera'))
                    },
                    {
                        id: 's8-save',
                        elementId: 'btn-save',
                        heading: 'Save your project',
                        content: 'Use <strong>Project → Save to Browser</strong> to store the scene locally. You can reopen it later with <strong>Load from Browser</strong>.',
                        ...task('Save the project to the browser', () => projectSaved())
                    },
                    {
                        id: 's8-vr',
                        elementId: 'btn-enter-vr',
                        heading: 'Preview in VR',
                        content: 'Press <strong>VR</strong> (or F5) to enter immersive mode. On a desktop without a headset you will get a “not available” notice — that is expected; the button now reflects device support.',
                        ...task('Press VR to preview the scene', (app) => {
                            const sceneEl = scene();
                            return !!app.tutorialPanel?.sawEvent('aframe-vr-clicked') || !!sceneEl?.is?.('vr-mode');
                        })
                    },
                    {
                        id: 's8-export-dialog',
                        elementId: 'btn-export',
                        heading: 'Open the Export dialog',
                        content: 'Press <strong>Export</strong> in the top bar. You can export a self-contained <strong>ZIP</strong> (HTML + CSS + assets), a single <strong>HTML</strong> file, or project <strong>JSON</strong>.',
                        ...task('Open the Export dialog', () => exportDialogOpen())
                    },
                    {
                        id: 's8-export',
                        elementId: 'btn-export',
                        heading: 'Export a standalone site',
                        content: 'Choose <strong>Export as ZIP</strong> (or HTML). The download includes every asset used by the scene, ready to upload to any static host.',
                        ...task('Export the scene', (app) => !!app.tutorialPanel?.sawEvent('aframe-exported'))
                    },
                    recap('s8-recap', 'Course complete 🎉',
                        'You have built, lit, materialised, animated, wired and exported an A-Frame scene. Revisit any session from the tabs above — your progress is saved automatically.')
                ]
            }
        ]
    };
}

export default createAFrameCourse;
