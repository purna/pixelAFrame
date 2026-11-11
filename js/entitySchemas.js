/**
 * Editable entity properties for the A-Frame builder.
 * Each field maps directly to an A-Frame attribute (or a component property).
 */
export const ENTITY_SCHEMAS = {
    'a-box': [
        { attribute: 'width', label: 'Width', type: 'number', step: 0.1, min: 0 },
        { attribute: 'height', label: 'Height', type: 'number', step: 0.1, min: 0 },
        { attribute: 'depth', label: 'Depth', type: 'number', step: 0.1, min: 0 }
    ],
    'a-sphere': [
        { attribute: 'radius', label: 'Radius', type: 'number', step: 0.1, min: 0 },
        { attribute: 'segments-width', label: 'Segments width', type: 'number', min: 3, step: 1 },
        { attribute: 'segments-height', label: 'Segments height', type: 'number', min: 2, step: 1 }
    ],
    'a-cylinder': [
        { attribute: 'radius', label: 'Radius', type: 'number', step: 0.1, min: 0 },
        { attribute: 'radius-top', label: 'Top radius', type: 'number', step: 0.1, min: 0 },
        { attribute: 'radius-bottom', label: 'Bottom radius', type: 'number', step: 0.1, min: 0 },
        { attribute: 'height', label: 'Height', type: 'number', step: 0.1, min: 0 },
        { attribute: 'segments-radial', label: 'Radial segments', type: 'number', min: 3, step: 1 },
        { attribute: 'open-ended', label: 'Open ended', type: 'boolean' }
    ],
    'a-cone': [
        { attribute: 'radius-bottom', label: 'Bottom radius', type: 'number', step: 0.1, min: 0 },
        { attribute: 'radius-top', label: 'Top radius', type: 'number', step: 0.1, min: 0 },
        { attribute: 'height', label: 'Height', type: 'number', step: 0.1, min: 0 },
        { attribute: 'segments-radial', label: 'Radial segments', type: 'number', min: 3, step: 1 }
    ],
    'a-plane': [
        { attribute: 'width', label: 'Width', type: 'number', step: 0.1, min: 0 },
        { attribute: 'height', label: 'Height', type: 'number', step: 0.1, min: 0 }
    ],
    'a-torus': [
        { attribute: 'radius', label: 'Radius', type: 'number', step: 0.1, min: 0 },
        { attribute: 'radius-tubular', label: 'Tube radius', type: 'number', step: 0.01, min: 0 },
        { attribute: 'segments-radial', label: 'Radial segments', type: 'number', min: 3, step: 1 },
        { attribute: 'segments-tubular', label: 'Tubular segments', type: 'number', min: 3, step: 1 }
    ],
    'a-torus-knot': [
        { attribute: 'radius', label: 'Radius', type: 'number', step: 0.1, min: 0 },
        { attribute: 'radius-tubular', label: 'Tube radius', type: 'number', step: 0.01, min: 0 },
        { attribute: 'p', label: 'P', type: 'number', min: 1, step: 1 },
        { attribute: 'q', label: 'Q', type: 'number', min: 1, step: 1 },
        { attribute: 'segments-radial', label: 'Radial segments', type: 'number', min: 3, step: 1 },
        { attribute: 'segments-tubular', label: 'Tubular segments', type: 'number', min: 3, step: 1 }
    ],
    'a-circle': [
        { attribute: 'radius', label: 'Radius', type: 'number', step: 0.1, min: 0 },
        { attribute: 'segments', label: 'Segments', type: 'number', min: 3, step: 1 },
        { attribute: 'theta-start', label: 'Theta start', type: 'number', step: 1 },
        { attribute: 'theta-length', label: 'Theta length', type: 'number', step: 1 }
    ],
    'a-ring': [
        { attribute: 'radius-inner', label: 'Inner radius', type: 'number', step: 0.1, min: 0 },
        { attribute: 'radius-outer', label: 'Outer radius', type: 'number', step: 0.1, min: 0 },
        { attribute: 'segments-theta', label: 'Theta segments', type: 'number', min: 3, step: 1 },
        { attribute: 'segments-phi', label: 'Phi segments', type: 'number', min: 3, step: 1 }
    ],
    'a-triangle': [
        { attribute: 'vertex-a', label: 'Vertex A', type: 'text' },
        { attribute: 'vertex-b', label: 'Vertex B', type: 'text' },
        { attribute: 'vertex-c', label: 'Vertex C', type: 'text' }
    ],
    'a-text': [
        { attribute: 'value', label: 'Text', type: 'textarea' },
        { attribute: 'align', label: 'Align', type: 'select', options: ['left', 'center', 'right'] },
        { attribute: 'color', label: 'Colour', type: 'color' },
        { attribute: 'width', label: 'Wrap width', type: 'number', step: 0.1, min: 0 },
        { attribute: 'font', label: 'Font', type: 'text' },
        { attribute: 'baseline', label: 'Baseline', type: 'select', options: ['top', 'center', 'bottom'] },
        { attribute: 'anchor', label: 'Anchor', type: 'select', options: ['left', 'center', 'right', 'align'] },
        { attribute: 'letter-spacing', label: 'Letter spacing', type: 'number', step: 1 },
        { attribute: 'line-height', label: 'Line height', type: 'number', step: 1 },
        { attribute: 'wrap-count', label: 'Wrap count', type: 'number', min: 1, step: 1 },
        { attribute: 'opacity', label: 'Opacity', type: 'number', min: 0, max: 1, step: 0.05 }
    ],
    'a-image': [
        { attribute: 'width', label: 'Width', type: 'number', step: 0.1, min: 0 },
        { attribute: 'height', label: 'Height', type: 'number', step: 0.1, min: 0 },
        { attribute: 'transparent', label: 'Transparent', type: 'boolean' },
        { attribute: 'opacity', label: 'Opacity', type: 'number', min: 0, max: 1, step: 0.05 }
    ],
    'a-video': [
        { attribute: 'width', label: 'Width', type: 'number', step: 0.1, min: 0 },
        { attribute: 'height', label: 'Height', type: 'number', step: 0.1, min: 0 },
        { attribute: 'loop', label: 'Loop', type: 'boolean' },
        { attribute: 'opacity', label: 'Opacity', type: 'number', min: 0, max: 1, step: 0.05 }
    ],
    'a-sky': [
        { attribute: 'radius', label: 'Radius', type: 'number', step: 0.5, min: 0 },
        { attribute: 'segments-width', label: 'Segments width', type: 'number', min: 3, step: 1 },
        { attribute: 'segments-height', label: 'Segments height', type: 'number', min: 2, step: 1 }
    ],
    'a-videosphere': [
        { attribute: 'radius', label: 'Radius', type: 'number', step: 0.5, min: 0 },
        { attribute: 'segments-width', label: 'Segments width', type: 'number', min: 3, step: 1 },
        { attribute: 'segments-height', label: 'Segments height', type: 'number', min: 2, step: 1 }
    ],
    'a-light': [
        { attribute: 'type', label: 'Type', type: 'select', options: ['ambient', 'directional', 'point', 'spot', 'hemisphere'] },
        { attribute: 'color', label: 'Colour', type: 'color' },
        { attribute: 'intensity', label: 'Intensity', type: 'number', min: 0, max: 10, step: 0.1 },
        { attribute: 'distance', label: 'Distance', type: 'number', min: 0, step: 0.5 },
        { attribute: 'angle', label: 'Cone angle', type: 'number', min: 0, max: 180, step: 1 },
        { attribute: 'penumbra', label: 'Penumbra', type: 'number', min: 0, max: 1, step: 0.05 },
        { attribute: 'decay', label: 'Decay', type: 'number', min: 0, step: 0.1 }
    ],
    'a-camera': [
        { attribute: 'camera', property: 'fov', label: 'Field of view', type: 'number', min: 30, max: 120, step: 1 },
        { attribute: 'camera', property: 'near', label: 'Near clip', type: 'number', step: 0.1 },
        { attribute: 'camera', property: 'far', label: 'Far clip', type: 'number', step: 10 },
        { attribute: 'active', label: 'Active camera', type: 'boolean' }
    ],
    'a-cursor': [
        { attribute: 'fuse', label: 'Fuse', type: 'boolean' },
        { attribute: 'fuse-timeout', label: 'Fuse timeout (ms)', type: 'number', min: 100, step: 100 },
        { attribute: 'color', label: 'Colour', type: 'color' },
        { attribute: 'opacity', label: 'Opacity', type: 'number', min: 0, max: 1, step: 0.05 },
        { attribute: 'ray-origin', label: 'Ray origin', type: 'text' }
    ],
    'a-tetrahedron': [
        { attribute: 'radius', label: 'Radius', type: 'number', step: 0.1, min: 0 },
        { attribute: 'detail', label: 'Detail', type: 'number', min: 0, step: 1 }
    ],
    'a-octahedron': [
        { attribute: 'radius', label: 'Radius', type: 'number', step: 0.1, min: 0 },
        { attribute: 'detail', label: 'Detail', type: 'number', min: 0, step: 1 }
    ],
    'a-dodecahedron': [
        { attribute: 'radius', label: 'Radius', type: 'number', step: 0.1, min: 0 },
        { attribute: 'detail', label: 'Detail', type: 'number', min: 0, step: 1 }
    ],
    'a-icosahedron': [
        { attribute: 'radius', label: 'Radius', type: 'number', step: 0.1, min: 0 },
        { attribute: 'detail', label: 'Detail', type: 'number', min: 0, step: 1 }
    ],
    'a-sound': [
        { attribute: 'autoplay', label: 'Autoplay', type: 'boolean' },
        { attribute: 'loop', label: 'Loop', type: 'boolean' },
        { attribute: 'volume', label: 'Volume', type: 'number', min: 0, max: 1, step: 0.05 },
        { attribute: 'positional', label: 'Positional audio', type: 'boolean' },
        { attribute: 'distance-model', label: 'Distance model', type: 'select', options: ['linear', 'inverse', 'exponential'] },
        { attribute: 'rolloff-factor', label: 'Rolloff factor', type: 'number', min: 0, step: 0.1 },
        { attribute: 'ref-distance', label: 'Reference distance', type: 'number', min: 0, step: 0.5 },
        { attribute: 'max-distance', label: 'Max distance', type: 'number', min: 0, step: 1 }
    ],
    'a-link': [
        { attribute: 'href', label: 'Link URL', type: 'text' },
        { attribute: 'title', label: 'Title', type: 'text' },
        { attribute: 'image', label: 'Preview image', type: 'text' },
        { attribute: 'src', label: 'Source', type: 'text' },
        { attribute: 'visualAspectEnabled', label: 'Show visual link', type: 'boolean' }
    ],
    'a-asset-item': [
        { attribute: 'src', label: 'Asset source', type: 'text' }
    ],
    'a-model': [],
    'a-gltf-model': [],
    'a-obj-model': [
        { attribute: 'src', label: 'OBJ source', type: 'text' },
        { attribute: 'mtl', label: 'MTL source', type: 'text' }
    ],
    'a-entity': []
};

export function getEntitySchema(tagName) {
    return ENTITY_SCHEMAS[String(tagName || '').toLowerCase()] || [];
}
