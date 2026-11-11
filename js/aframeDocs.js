/**
 * Human-friendly A-Frame documentation used by the properties panel.
 * Examples are intentionally short and classroom-friendly.
 */

export const ENTITY_DOCS = {
    'a-box': {
        label: 'Box',
        description: 'A rectangular cuboid. Boxes are the basic building blocks for rooms, furniture, platforms and Minecraft-style worlds.',
        example: `<a-box
  position="0 0.5 -3"
  width="1"
  height="1"
  depth="1"
  color="#4CC3D9">
</a-box>`
    },
    'a-sphere': {
        label: 'Sphere',
        description: 'A round 3D primitive. Useful for planets, balls, heads and other curved objects.',
        example: `<a-sphere
  position="0 1 -3"
  radius="0.5"
  color="#EF2D5E">
</a-sphere>`
    },
    'a-cylinder': {
        label: 'Cylinder',
        description: 'A cylinder with a circular cross-section. Good for pillars, cups, wheels and machine parts.',
        example: `<a-cylinder
  position="0 0.75 -3"
  radius="0.5"
  height="1.5"
  color="#FFC65D">
</a-cylinder>`
    },
    'a-cone': {
        label: 'Cone',
        description: 'A cone primitive. Useful for trees, roofs, arrows and rockets.',
        example: `<a-cone
  position="0 0.75 -3"
  radius-bottom="0.5"
  height="1.5"
  color="#7BC8A4">
</a-cone>`
    },
    'a-plane': {
        label: 'Plane',
        description: 'A flat rectangle. Commonly used as a floor, wall, screen or picture surface.',
        example: `<a-plane
  position="0 0 -4"
  rotation="-90 0 0"
  width="10"
  height="10"
  color="#333333">
</a-plane>`
    },
    'a-torus': {
        label: 'Torus',
        description: 'A ring or doughnut shape. Useful for wheels, rings and decorative objects.',
        example: `<a-torus
  position="0 1 -3"
  radius="0.6"
  radius-tubular="0.15"
  color="#4CC3D9">
</a-torus>`
    },
    'a-torus-knot': {
        label: 'Torus Knot',
        description: 'A twisted mathematical knot. Fun for decoration and showing complex geometry.',
        example: `<a-torus-knot
  position="0 1 -3"
  radius="0.5"
  radius-tubular="0.1"
  color="#EF2D5E">
</a-torus-knot>`
    },
    'a-circle': {
        label: 'Circle',
        description: 'A flat circle. Useful for buttons, portals and simple UI surfaces.',
        example: `<a-circle
  position="0 1 -3"
  radius="0.5"
  color="#FFC65D">
</a-circle>`
    },
    'a-ring': {
        label: 'Ring',
        description: 'A flat ring with an inner and outer radius. Great for targets, halos and markers.',
        example: `<a-ring
  position="0 1 -3"
  radius-inner="0.25"
  radius-outer="0.5"
  color="#7BC8A4">
</a-ring>`
    },
    'a-triangle': {
        label: 'Triangle',
        description: 'A flat triangle defined by three points. Useful for simple 2D shapes and signs.',
        example: `<a-triangle
  position="0 1 -3"
  vertex-a="0 0 0"
  vertex-b="1 0 0"
  vertex-c="0.5 1 0"
  color="#4CC3D9">
</a-triangle>`
    },
    'a-image': {
        label: 'Image',
        description: 'A flat image in the 3D world. Use it for thumbnails, signs, posters and gallery items.',
        example: `<a-image
  src="#my-image"
  position="0 1.5 -3"
  width="3"
  height="2">
</a-image>`
    },
    'a-video': {
        label: 'Video',
        description: 'A flat video screen. The source can be a video URL or an asset ID such as #my-video.',
        example: `<a-video
  src="#my-video"
  position="0 1.5 -3"
  width="4"
  height="2.25">
</a-video>`
    },
    'a-sky': {
        label: 'Sky / 360 Panorama',
        description: 'A large sphere surrounding the scene. Use a colour or a 360° image for a skybox or panorama.',
        example: `<a-sky
  src="#my-panorama"
  rotation="0 -90 0">
</a-sky>`
    },
    'a-videosphere': {
        label: '360 Video',
        description: 'A spherical video surface. Use it for immersive 360° video experiences.',
        example: `<a-videosphere
  src="#my-360-video">
</a-videosphere>`
    },
    'a-sound': {
        label: 'Audio',
        description: 'Plays audio in the scene. Sounds can be positional or non-positional and may autoplay or loop.',
        example: `<a-sound
  src="#my-audio"
  autoplay="false"
  loop="false"
  volume="0.8">
</a-sound>`
    },
    'a-text': {
        label: 'Text',
        description: 'Displays text in 3D. Use it for labels, instructions, quiz feedback and titles.',
        example: `<a-text
  value="Hello A-Frame!"
  position="0 1.6 -3"
  align="center"
  color="#FFFFFF"
  width="3">
</a-text>`
    },
    'a-gltf-model': {
        label: 'GLTF Model',
        description: 'Loads a 3D model in GLTF or GLB format. Models can include animations when combined with animation-mixer.',
        example: `<a-gltf-model
  src="#my-model"
  position="0 0 -3"
  scale="0.5 0.5 0.5">
</a-gltf-model>`
    },
    'a-obj-model': {
        label: 'OBJ Model',
        description: 'Loads an OBJ model, optionally with an MTL material file.',
        example: `<a-obj-model
  src="#my-obj"
  mtl="#my-mtl"
  position="0 0 -3">
</a-obj-model>`
    },
    'a-light': {
        label: 'Light',
        description: 'Adds light to the scene. Common types are ambient, directional, point, spot and hemisphere.',
        example: `<a-light
  type="point"
  color="#FFFFFF"
  intensity="1"
  position="0 3 0">
</a-light>`
    },
    'a-camera': {
        label: 'Camera',
        description: 'The viewer’s camera. Look controls let the user look around with a mouse, touch or headset.',
        example: `<a-entity position="0 1.6 5">
  <a-camera look-controls wasd-controls>
  </a-camera>
</a-entity>`
    },
    'a-entity': {
        label: 'Entity',
        description: 'A generic container. Components are attached to entities to give them appearance, behaviour or position.',
        example: `<a-entity
  position="0 1 -3"
  geometry="primitive: box"
  material="color: #4CC3D9">
</a-entity>`
    },
    'a-cursor': {
        label: 'Cursor',
        description: 'A gaze cursor used for looking at and clicking objects in VR or with a mouse.',
        example: `<a-camera>
  <a-cursor
    fuse="true"
    fuse-timeout="1500"
    color="#FFFFFF">
  </a-cursor>
</a-camera>`
    },
    'a-assets': {
        label: 'Assets Container',
        description: 'Preloads images, audio, video and models so they can be reused by many entities using #asset-id.',
        example: `<a-assets>
  <img id="my-image" src="texture.jpg">
  <audio id="my-audio" src="sound.mp3"></audio>
  <a-asset-item id="my-model" src="model.glb"></a-asset-item>
</a-assets>`
    },
    'a-mixin': {
        label: 'Mixin',
        description: 'A reusable bundle of components stored in assets. Apply it with the mixin attribute.',
        example: `<a-assets>
  <a-mixin
    id="blue-box"
    geometry="primitive: box"
    material="color: #4CC3D9">
  </a-mixin>
</a-assets>

<a-entity mixin="blue-box" position="0 1 -3"></a-entity>`
    }
};

export const COMPONENT_DOCS = {
    geometry: {
        label: 'Geometry',
        description: 'Defines the shape of an entity. A-Frame primitives such as a-box automatically include geometry.',
        example: `<a-entity
  geometry="primitive: box; width: 1; height: 1; depth: 1">
</a-entity>`
    },
    material: {
        label: 'Material',
        description: 'Controls an entity’s colour, texture, metalness, roughness and transparency.',
        example: `<a-entity
  geometry="primitive: box"
  material="color: #00ff41; metalness: 0.3; roughness: 0.5">
</a-entity>`
    },
    animation: {
        label: 'Animation',
        description: 'Animates a property over time, such as position, rotation, scale or colour. Events can start and stop it.',
        example: `<a-entity
  geometry="primitive: box"
  animation="property: rotation;
             to: 0 360 0;
             dur: 3000;
             loop: true;
             easing: linear">
</a-entity>`
    },
    'animation-mixer': {
        label: 'Animation Mixer',
        description: 'Plays animations embedded in GLTF/GLB models.',
        example: `<a-gltf-model
  src="#character"
  animation-mixer="clip: *; loop: repeat">
</a-gltf-model>`
    },
    sound: {
        label: 'Sound',
        description: 'Plays audio from a URL or asset. Use play/pause events or a behaviour to trigger it.',
        example: `<a-entity
  sound="src: #my-audio; autoplay: false; loop: false; volume: 0.8">
</a-entity>`
    },
    light: {
        label: 'Light',
        description: 'Light component for a-light entities. Set type, colour, intensity and distance.',
        example: `<a-light
  type="point"
  color="#FFFFFF"
  intensity="1.2"
  distance="20">
</a-light>`
    },
    shadow: {
        label: 'Shadow',
        description: 'Lets an object cast or receive shadows when the scene has shadows enabled.',
        example: `<a-entity
  geometry="primitive: box"
  material="color: #4CC3D9"
  shadow="cast: true; receive: false">
</a-entity>`
    },
    'look-controls': {
        label: 'Look Controls',
        description: 'Lets the camera look around using mouse, touch, gyroscope or VR headset tracking.',
        example: `<a-camera look-controls="reverseMouseDrag: false">
</a-camera>`
    },
    'wasd-controls': {
        label: 'WASD Controls',
        description: 'Lets the user move the camera with W, A, S and D keys.',
        example: `<a-camera wasd-controls="acceleration: 65">
</a-camera>`
    },
    cursor: {
        label: 'Cursor',
        description: 'Creates a gaze cursor for interacting with objects in VR. A fuse lets users select by looking.',
        example: `<a-cursor
  fuse="true"
  fuse-timeout="1500"
  color="#FFFFFF">
</a-cursor>`
    },
    raycaster: {
        label: 'Raycaster',
        description: 'Casts a ray from the controller or cursor to find objects that are being pointed at.',
        example: `<a-entity raycaster="objects: .clickable; far: 20">
</a-entity>`
    },
    'super-hands': {
        label: 'Super Hands',
        description: 'Adds grabbing, stretching and dragging interactions for VR controllers.',
        example: `<a-entity
  laser-controls
  raycaster="objects: .grabbable"
  super-hands>
</a-entity>`
    },
    environment: {
        label: 'Environment',
        description: 'Generates a complete environment with a sky, ground, lighting and optional fog.',
        example: `<a-entity
  environment="preset: forest; skyType: atmosphere; lighting: distant">
</a-entity>`
    },
    text: {
        label: 'Text',
        description: 'Text component for a-text entities. Set the value, alignment, colour and width.',
        example: `<a-text
  value="Welcome!"
  align="center"
  color="#FFFFFF"
  width="4">
</a-text>`
    },
    visible: {
        label: 'Visibility',
        description: 'Turns an entity on or off without removing it from the scene.',
        example: `<a-entity visible="false">
</a-entity>`
    },
    'studio-behavior': {
        label: 'Behaviour / Trigger',
        description: 'The custom action system used by click-to-add behaviours. It listens for events and runs simple actions.',
        example: `<a-entity
  studio-behavior="actions: [
    {\\"trigger\\": \\"click\\", \\"type\\": \\"toggle-visibility\\"}
  ]">
</a-entity>`
    },
    'studio-particles': {
        label: 'Particle Effect',
        description: 'A lightweight particle effect for snow, sparks and magical atmospheres.',
        example: `<a-entity
  studio-particles="count: 180;
                    color: #7dd3fc;
                    size: 0.09;
                    speed: 0.7;
                    spread: 5;
                    height: 5">
</a-entity>`
    },
    'studio-drag': {
        label: 'Grab and Move',
        description: 'Lets students drag an object with the mouse or pointer.',
        example: `<a-entity
  geometry="primitive: box"
  material="color: #00ff41"
  studio-drag="enabled: true">
</a-entity>`
    },
    'studio-open-close': {
        label: 'Open / Close',
        description: 'Rotates an object such as a door around a hinge axis when it is clicked.',
        example: `<a-entity
  geometry="primitive: box"
  studio-open-close="angle: 90; duration: 900; axis: y">
</a-entity>`
    },
    'studio-counter': {
        label: 'Count and Reward',
        description: 'Counts clicks and emits a reward event when a target number is reached.',
        example: `<a-entity
  studio-counter="target: 5;
                  message: Well done!;
                  rewardEvent: counter-complete">
</a-entity>`
    },
    'studio-condition': {
        label: 'Show If Correct',
        description: 'Shows or hides a target entity when a named event occurs, such as a correct answer.',
        example: `<a-entity
  studio-condition="event: correct;
                    target: #reward-text;
                    action: show">
</a-entity>`
    }
};

export function getEntityDoc(tagName) {
    const tag = String(tagName || '').toLowerCase();
    return ENTITY_DOCS[tag] || {
        label: tag || 'Entity',
        description: `The <${tag || 'a-entity'}> A-Frame element. Add components to give it appearance and behaviour.`,
        example: `<${tag || 'a-entity'}></${tag || 'a-entity'}>`
    };
}

export function getComponentDoc(name) {
    return COMPONENT_DOCS[name] || {
        label: name,
        description: `The “${name}” A-Frame component. Attach it to an entity and configure its properties in this panel.`,
        example: `<a-entity ${name}></a-entity>`
    };
}

/**
 * Small HTML prettifier for snippets shown in the properties panel.
 * It keeps the author-written line breaks and normalises indentation.
 */
export function formatExampleHTML(code) {
    if (!code) return '';
    const lines = String(code).replace(/\t/g, '  ').split('\n');
    const output = [];
    let depth = 0;
    let insideTag = false;

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        if (insideTag) {
            output.push('  '.repeat(depth + 1) + trimmed);
            if (trimmed.endsWith('>')) {
                insideTag = false;
                depth += 1;
            }
            return;
        }

        if (/^<\//.test(trimmed)) {
            depth = Math.max(0, depth - 1);
            output.push('  '.repeat(depth) + trimmed);
            return;
        }

        output.push('  '.repeat(depth) + trimmed);

        if (trimmed.startsWith('<') && !trimmed.endsWith('>')) {
            insideTag = true;
        } else if (/^<[^/!][^>]*>$/.test(trimmed) && !/\/>$/.test(trimmed) && !/<\/[^>]+>$/.test(trimmed)) {
            depth += 1;
        }
    });

    return output.join('\n');
}
