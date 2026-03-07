# Pixel 3D - Pro Staging Studio

> A powerful browser-based virtual 3D modeling and staging application with AI-powered scene generation and VR/AR capabilities.

![Pixel 3D Hero Screenshot](./screenshots/hero-screenshot.png)
*[Replace with actual hero screenshot showing the main application interface]*

## 🌟 Features

### 🎨 3D Scene Creation
- **Professional 3D Modeling**: Create complex 3D scenes directly in your browser
- **Primitive Shapes**: Comprehensive set of 3D primitives (Box, Sphere, Cone, Cylinder, Plane, Torus, Tetrahedron, Octahedron, Dodecahedron, Icosahedron, Torus Knot)
- **Advanced Lighting**: Multiple light types including Point, Spot, Directional, Ambient, and Hemisphere lighting
- **Real-time Rendering**: Powered by Three.js with high-performance WebGL rendering

### 🥽 VR/AR Support (NEW!)
- **A-Frame Integration**: Create VR-ready 3D scenes with full WebXR support
- **VR Mode**: Enter immersive VR mode with headset support (F5)
- **AR Mode**: View scenes in augmented reality
- **A-Frame Elements**: Full toolbar menu with primitives, media, models, environment, and VR interaction elements
- **Animation Playback**: Play/stop animations in VR (F8/F9)

### 🤖 AI-Powered Scene Generation
- **Magic Scene Generator**: Describe your scene in natural language and let AI create it
- **Gemini Integration**: Uses Google's Gemini AI for intelligent scene generation
- **Smart Object Placement**: AI automatically positions and colors objects based on your description

### 👥 Character Animation
- **Animated Characters**: Support for Xbot (female) and Ybot (male) characters
- **GLTF Support**: Full compatibility with GLTF 3D models
- **Animation Blending**: Smooth transitions between idle, walk, and run animations
- **Real-time Animation**: Character animations update in real-time

### 🎯 Professional Tools
- **Transform Controls**: Move, rotate, and scale objects with precision
- **Layer Management**: Organize objects in folders for better scene organization
- **Materials System**: Comprehensive material editor with color management
- **History Management**: Full undo/redo functionality for all actions
- **A-Frame Mode**: Toggle between Three.js editor and A-Frame preview (F6)

### 📸 Export & Production
- **High-Resolution Export**: Export scenes as PNG with customizable resolution
- **Multiple Formats**: Support for Full HD (1920×1080), 2K (2560×1440), 4K (3840×2160)
- **Custom Resolutions**: Set any custom width and height for exports
- **Camera Border**: Visual preview of export area with draggable preview
- **Transparent Background**: Optional transparent background for compositing
- **A-Frame Export**: Export scenes as standalone HTML files or ZIP archives for VR

### ⚙️ Advanced Settings
- **Grid & Axes**: Toggle grid and axes helpers for precise positioning
- **Snap to Grid**: Optional grid snapping for accurate placement
- **Camera Controls**: Adjustable camera speed and movement sensitivity
- **Autosave**: Automatic scene saving with customizable intervals
- **Performance Tuning**: High-performance WebGL settings optimized for smooth rendering

### 💾 File Management
- **Browser Storage**: Save scenes directly to your browser
- **JSON Import/Export**: Full scene serialization and loading
- **Export Options**: Multiple export formats including PNG, JSON, and A-Frame HTML
- **ZIP Export**: Download complete A-Frame projects as ZIP files

## 🚀 Quick Start

### Installation
1. Clone or download the repository
2. Open `index.html` in a modern web browser
3. No additional installation required - runs entirely in the browser!

### First Scene
1. **Add Objects**: Click the shapes menu to add basic 3D shapes
2. **Select & Transform**: Use transform tools to move, rotate, and scale objects
3. **Add Lighting**: Use the lights menu to illuminate your scene
4. **Generate with AI**: Try the Magic Scene Generator for AI-assisted scene creation
5. **Export**: Use the export tool to save your creation as a PNG image

### Creating VR Scenes
1. **Toggle A-Frame Mode**: Press F6 or click the A-Frame button in header
2. **Add A-Frame Elements**: Use the toolbar menu to add VR elements
3. **Add Animations**: Select entities and configure animation properties
4. **Preview**: Press F8 to play animations in preview mode
5. **Enter VR**: Press F5 to enter immersive VR mode (with headset)
6. **Export**: Click "Export ZIP" to download a complete VR-ready project

![Quick Start Demo](./demos/quick-start-demo.gif)
*[Replace with actual demo video showing basic scene creation]*

## 📖 User Guide

### Interface Overview

![Interface Overview](./screenshots/interface-overview.png)
*[Replace with annotated screenshot showing all interface elements]*

#### Header Bar
- **Logo**: Pixel 3D branding with version indicator
- **Undo/Redo**: History navigation controls
- **File Operations**: Clear, Load, Save to Browser, Export
- **VR/AR Buttons**: Enter VR (F5) and AR modes
- **A-Frame Toggle**: Switch between Three.js and A-Frame modes (F6)

#### Left Toolbar
- **Selection Tool**: Click to select objects (Keyboard: Q)
- **AI Scene Generator**: Magic wand icon for AI-powered scene creation
- **Shapes Menu**: Comprehensive primitive shape tools
- **Characters Menu**: Animated character models
- **Lights Menu**: Various lighting options
- **A-Frame Elements**: VR element creation (primitives, media, models, environment)
- **Materials Tool**: Material editor and manager
- **Scene Settings**: Export and scene configuration
- **Settings**: Application preferences

#### Canvas Area
- **3D Viewport**: Real-time 3D scene rendering
- **Transform Controls**: Move, rotate, scale buttons
- **Zoom Controls**: Zoom slider and controls
- **Grid & Axes**: Visual helpers for positioning
- **Overlay Controls**: Play/Stop buttons for A-Frame animations

#### Right Panel
- **Scene Objects**: Layer manager and object list (shows A-Frame entities in A-Frame mode)
- **Properties**: Object-specific property editor
- **Materials**: Material management section
- **Scene Export**: Export settings and preview

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Q` | Select Tool |
| `H` | Hand Tool (Pan/Rotate View) |
| `G` | Translate Mode (Move objects) |
| `R` | Rotate Mode |
| `S` | Scale Mode |
| `X` | Delete Selected Object |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+Shift+O` | Toggle Overlays |
| `Ctrl+Shift+L` | Load from Browser |
| `+/-` | Zoom In/Out |
| `F5` | Enter VR Mode |
| `F6` | Toggle A-Frame Mode |
| `F8` | Play Animations |
| `F9` | Stop Animations |

### AI Scene Generation

![AI Scene Generator](./demos/ai-scene-generation.gif)
*[Replace with demo video showing AI scene generation]*

1. Click the Magic Wand icon in the toolbar
2. Enter a description of your desired scene
3. Click "Generate ✨" and watch AI create your scene
4. Example prompts:
   - "A circle of blue boxes with a red sphere in the middle"
   - "A futuristic city with tall buildings and flying cars"
   - "A peaceful forest with trees, rocks, and a small pond"

### Character Animation

![Character Animation](./demos/character-animation.gif)
*[Replace with demo video showing character loading and animation]*

1. Access the Characters menu in the left toolbar
2. Select Xbot (female) or Ybot (male) character
3. Characters automatically animate with idle, walk, and run cycles
4. Use transform controls to position and scale characters

### VR Scene Creation

![VR Scene Creation](./demos/vr-scene-creation.gif)
*[Replace with demo video showing VR scene creation]*

1. Press F6 or click "A-Frame" to switch to A-Frame mode
2. Use the A-Frame Elements toolbar menu to add VR objects:
   - **Primitives**: Box, Sphere, Cylinder, Cone, Plane, Torus, etc.
   - **Media**: Images, Videos, 360° images, Audio
   - **Models**: GLTF models with animation support
   - **Environment**: Sky, lighting, environment presets
   - **VR Interaction**: Hand controls, cursors, raycasters
3. Select entities to edit properties in the right panel
4. Press F8 to preview animations
5. Press F5 to enter VR mode (requires VR headset)

### Exporting Scenes

![Export Process](./demos/export-process.gif)
*[Replace with demo video showing the export process]*

1. Open the Scene Export section in the right panel
2. Configure export settings:
   - Canvas size (width/height)
   - Show/Hide camera border
   - Background transparency
3. Click "Export as PNG" to save your scene
4. Choose from preset resolutions or set custom dimensions

### Exporting VR Projects

1. Switch to A-Frame mode (F6)
2. Add your A-Frame elements
3. Click "Export ZIP" in the header
4. Downloads a ZIP containing:
   - `index.html` - Complete A-Frame scene
   - `css/style.css` - Basic styles
   - `assets/` - Folder structure for models and media

## 🎯 Use Cases

### Content Creation
- **Social Media**: Create eye-catching 3D images for posts
- **Marketing**: Generate product visualizations and scene mockups
- **Presentations**: Design 3D backgrounds and visual elements

### VR/AR Development
- **WebVR Experiences**: Create immersive VR websites
- **Virtual Tours**: Build 360° environment tours
- **Interactive Training**: Develop VR training simulations

### Design & Prototyping
- **Product Visualization**: Prototype 3D product designs
- **Architecture**: Create preliminary architectural visualizations
- **Game Development**: Rapid prototyping for 3D game scenes

### Education & Learning
- **3D Modeling Education**: Learn 3D concepts in a browser
- **Scene Composition**: Study lighting, materials, and composition
- **VR Development**: Learn A-Frame webVR development
- **AI Collaboration**: Explore AI-assisted creative workflows

## 🛠️ Technical Details

### Technology Stack
- **3D Engine**: Three.js WebGL
- **VR Framework**: A-Frame (WebXR)
- **AI Integration**: Google Gemini API
- **Character Models**: GLTF format support
- **Storage**: Browser Local Storage
- **Export**: PNG, JSON, A-Frame HTML, ZIP
- **Architecture**: Modular ES6 JavaScript classes

### A-Frame Integration
- **Core**: A-Frame 1.5.0 with WebXR support
- **Extras**: A-Frame Extras for animation-mixer and controls
- **Environment**: A-Frame Environment Component for procedural scenes
- **Interaction**: Super Hands for VR interaction
- **Physics**: A-Frame Physics System for collision detection

### Performance
- **WebGL Acceleration**: Hardware-accelerated 3D rendering
- **Optimized Materials**: Efficient material and lighting systems
- **Smart Caching**: Character models cached for smooth animation
- **Responsive Design**: Optimized for various screen sizes

### Browser Compatibility
- **Chrome**: Full support (recommended for VR)
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile**: Limited support (desktop recommended for editing)

## 📁 Project Structure

```
pixel3d-main/
├── index.html              # Main application entry point
├── css/
│   └── styles.css          # Complete application styling
├── js/
│   ├── main.js             # Application bootstrap and core logic
│   ├── ui.js               # User interface management
│   ├── factory.js          # 3D object creation factory
│   ├── aframeFactory.js    # A-Frame entity factory (NEW!)
│   ├── aframeSceneManager.js # A-Frame scene management (NEW!)
│   ├── gemini.js           # AI scene generation
│   ├── characterManager.js # Character animation system
│   ├── materialsManager.js # Material editing & mixins system
│   ├── layerManager.js     # Scene organization & A-Frame entities
│   ├── cameraManager.js    # Camera control system
│   ├── historyManager.js   # Undo/redo functionality
│   ├── fileManager.js      # Save/load/export system
│   ├── tooltip.js          # Help tooltips
│   └── config.js           # Application configuration
├── assets/
│   └── aframe/            # A-Frame preloaded assets (NEW!)
│       ├── audio/          # Sound files
│       └── models/         # GLTF models
├── Art/
│   ├── Xbot.blend          # Blender source for female character
│   ├── Xbot.glb            # GLTF female character model
│   ├── Ybot.blend          # Blender source for male character
│   └── Ybot.glb            # GLTF male character model
├── fonts/
│   └── inter-normal.woff2  # Inter font family
├── docs/                   # Documentation and test files
└── screenshots/            # Application screenshots
```

## 🎨 Customization

### Adding New Shapes
1. Extend the `ObjectFactory` class in `js/factory.js`
2. Add shape creation logic
3. Update the shapes menu in `index.html`
4. Implement selection and transform handling

### Adding A-Frame Elements
1. Extend `AFrameFactory` in `js/aframeFactory.js`
2. Add element creation method
3. Update toolbar menu in `index.html`
4. Add to entity selection system

### AI Prompts
Customize AI behavior by modifying the system prompts in `js/gemini.js`:
- Scene generation prompts
- Material color generation
- Object placement logic

### Materials
Extend the materials system by:
- Adding new material types in `js/materialsManager.js`
- Implementing custom shaders
- Creating material presets
- Creating A-Frame mixins for VR

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the Repository**: Create your own copy
2. **Feature Branch**: Create a branch for your feature
3. **Code Standards**: Follow existing code patterns
4. **Testing**: Test your changes thoroughly
5. **Pull Request**: Submit your changes for review

### Development Setup
1. Clone the repository
2. Open `index.html` in a local web server
3. Enable browser developer tools for debugging
4. Make changes and test in multiple browsers

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Three.js Community**: For the amazing 3D WebGL framework
- **A-Frame Community**: For the powerful WebVR framework
- **Google Gemini**: For AI-powered scene generation
- **Mixamo**: For providing high-quality character models
- **Inter Font**: For the beautiful typography
- **Font Awesome**: For the comprehensive icon set

## 📞 Support

- **Documentation**: Check this README and inline tooltips
- **Issues**: Report bugs and feature requests on GitHub
- **Community**: Join discussions and share your creations

---

**Pixel 3D - Pro Virtual Studio** - Creating the future of browser-based 3D design and VR experiences, one pixel at a time. 🚀

![Pixel 3D Logo](./branding/pixel3d-logo.png)
*[Replace with actual application logo]*
