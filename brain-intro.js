// Brain animation for intro section
(function() {
  // Adaptive dot count based on device performance
  const getOptimalDotCount = () => {
    // Check device capabilities
    const isHighPerf = navigator.hardwareConcurrency >= 8 &&
                       (window.devicePixelRatio || 1) <= 2;
    // Reduce dots on mobile or low-end devices
    if (window.innerWidth < 768 || !isHighPerf) {
      return 3000; // Lower count for mobile/low-end
    }
    return 5000; // Reduced count for faster loading
  };
  const NUM_DOTS = getOptimalDotCount();
  const BASE_SIZE = 3.0;
  const DOT_SIZE = 16.0; // Uniform size for all dots (reduced for more dots to fit)
  // Minimum distance should be at least DOT_SIZE to prevent overlap (each dot has radius DOT_SIZE/2)
  const MIN_DISTANCE = DOT_SIZE * 1.1; // Minimum distance between dots (110% of size to prevent overlap)
  const MIN_DISTANCE_SQ = MIN_DISTANCE * MIN_DISTANCE; // Squared distance for faster comparison
  const MUTED_RED = new THREE.Color('#000000');
  const EASE = 0.18;

  let renderer, scene, camera;
  let positions, basePositions, sizes, targetSizes, baseSizes, phases, driftDirs, driftAmps, driftSpeeds, points, geometry, material;
  let brainBBox, brainTransform = { scale: 1, offsetX: 0, offsetY: 0 };
  let svgPathD = null;
  let path2D = null;
  let offscreen = null;
  let pointer = { x: -1e9, y: -1e9, inside: false };
  let bgEl = null;
  let gradState = { x: 0, y: 0, t: 0 };
  let containerEl = null;
  let containerWidth = 0;
  let containerHeight = 0;
  let resizeObserver = null;
  let initAttempts = 0;
  const MAX_INIT_ATTEMPTS = 50; // Max 5 seconds of retries
  let currentBgColor = { r: 1.0, g: 1.0, b: 1.0 }; // Current color (normalized RGB)
  let startBgColor = { r: 1.0, g: 1.0, b: 1.0 }; // Starting color for transition
  let targetBgColor = { r: 1.0, g: 1.0, b: 1.0 }; // Target color for transition
  let colorTransitionStart = null;
  let COLOR_TRANSITION_DURATION = 300; // Will be read from CSS
  let cachedBgColor = null; // Cache background color to avoid expensive getComputedStyle calls
  let bgColorCheckCounter = 0; // Only check background color every N frames
  let renderedDotsCount = 0; // Track how many dots are actually rendered
  let renderedDotsLogged = false; // Only log once after initialization
  
  // Line connections for expanded dots
  let lineGeometry = null;
  let lineMaterial = null;
  let lineSegments = null;
  let linePositions = null;
  let lineOpacities = null;
  let lineTargetOpacities = null;
  const MAX_CONNECTION_DISTANCE = 100; // Maximum distance to connect dots (reduced for performance)
  const MAX_ONE_LEVEL_OUT_DISTANCE = 70; // Maximum distance for one-level-out connections (reduced for performance)
  const EXPANDED_SIZE_THRESHOLD = DOT_SIZE + 3; // Size threshold to consider a dot "expanded"
  const MAX_LINES = 1500; // Maximum number of line segments (reduced for performance)
  const LINE_WIDTH = 2.5; // Line thickness in pixels
  const MAX_CONNECTIONS = 12; // Maximum number of connections to display (reduced for performance)
  
  // Dot color transition
  let currentDotColor = { r: 0.0, g: 0.0, b: 0.0 }; // Current dot color (black in light mode)
  let startDotColor = { r: 0.0, g: 0.0, b: 0.0 }; // Starting dot color for transition
  let targetDotColor = { r: 0.0, g: 0.0, b: 0.0 }; // Target dot color for transition

  // Wait for DOM to be ready and container to be visible
  function tryInit() {
    initAttempts++;
    if (initAttempts > MAX_INIT_ATTEMPTS) {
      console.warn('Brain initialization timeout - container may not be available');
      return;
    }

    containerEl = document.getElementById('brain-app');
    bgEl = document.getElementById('brain-bg');
    
    if (!containerEl) {
      // Retry if container not found yet (might be hidden by password modal)
      setTimeout(tryInit, 100);
      return;
    }

    // Check if container has dimensions
    const rect = containerEl.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      // Container not visible yet, retry
      setTimeout(tryInit, 100);
      return;
    }

    init().catch(err => {
      console.error('Error initializing brain:', err);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    // Small delay to ensure DOM is fully ready
    setTimeout(tryInit, 50);
  }

  async function init() {
    // Get container dimensions
    updateContainerSize();
    
    // Ensure we have valid dimensions
    if (containerWidth <= 0 || containerHeight <= 0) {
      console.warn('Container dimensions invalid, retrying...');
      setTimeout(init, 100);
      return;
    }

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    // Limit pixel ratio for better performance (especially on high-DPI displays)
    const pixelRatio = Math.min(1.5, window.devicePixelRatio || 1);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(containerWidth, containerHeight);
    
    // Set background to transparent
    renderer.setClearColor(0x000000, 0); // Transparent background
    
    // Initialize colors (normalized RGB: 0x1a1a1a = 26/255, 0xffffff = 255/255)
    const isDarkMode = document.body.classList.contains('dark-mode');
    if (isDarkMode) {
      currentBgColor = { r: 26/255, g: 26/255, b: 26/255 };
      startBgColor = { r: 26/255, g: 26/255, b: 26/255 };
      targetBgColor = { r: 26/255, g: 26/255, b: 26/255 };
      // Dots are white in dark mode
      currentDotColor = { r: 1.0, g: 1.0, b: 1.0 };
      startDotColor = { r: 1.0, g: 1.0, b: 1.0 };
      targetDotColor = { r: 1.0, g: 1.0, b: 1.0 };
    } else {
      currentBgColor = { r: 1.0, g: 1.0, b: 1.0 };
      startBgColor = { r: 1.0, g: 1.0, b: 1.0 };
      targetBgColor = { r: 1.0, g: 1.0, b: 1.0 };
      // Dots are black in light mode
      currentDotColor = { r: 0.0, g: 0.0, b: 0.0 };
      startDotColor = { r: 0.0, g: 0.0, b: 0.0 };
      targetDotColor = { r: 0.0, g: 0.0, b: 0.0 };
    }
    
    containerEl.appendChild(renderer.domElement);
    
    // Read actual CSS transition duration from computed styles
    const computedStyle = window.getComputedStyle(document.body);
    const transitionDuration = computedStyle.getPropertyValue('transition-duration');
    // Parse "0.3s" or "300ms" to milliseconds (handle multiple values like "0.3s, 0.3s")
    if (transitionDuration) {
      // Get first value if multiple exist
      const firstValue = transitionDuration.split(',')[0].trim();
      const match = firstValue.match(/([\d.]+)(s|ms)/);
      if (match) {
        const value = parseFloat(match[1]);
        const unit = match[2];
        COLOR_TRANSITION_DURATION = unit === 's' ? value * 1000 : value;
      }
    }
    
    // Listen for theme changes with smooth transition
    // MutationObserver fires synchronously when class changes, which is when CSS transitions start
    let isNavigatingAway = false;
    
    // Detect when navigating away from page
    window.addEventListener('beforeunload', () => {
      isNavigatingAway = true;
    });
    
    // Also check visibility change (when tab becomes hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isNavigatingAway = true;
      }
    });
    
    const themeObserver = new MutationObserver((mutations) => {
      // Skip theme transition if navigating away to prevent canvas going blank
      if (isNavigatingAway) return;
      
      const isDark = document.body.classList.contains('dark-mode');
      // Store current colors as starting point
      startBgColor = { ...currentBgColor };
      startDotColor = { ...currentDotColor };
      // Set target colors (normalized RGB)
      if (isDark) {
        targetBgColor = { r: 26/255, g: 26/255, b: 26/255 };
        targetDotColor = { r: 1.0, g: 1.0, b: 1.0 }; // White dots in dark mode
      } else {
        targetBgColor = { r: 1.0, g: 1.0, b: 1.0 };
        targetDotColor = { r: 0.0, g: 0.0, b: 0.0 }; // Black dots in light mode
      }
      
      // Update line color: white in dark mode, black in light mode
      if (lineMaterial) {
        const newLineColor = isDark 
          ? new THREE.Color(1.0, 1.0, 1.0) // White in dark mode
          : new THREE.Color(0.0, 0.0, 0.0); // Black in light mode
        lineMaterial.uniforms.uColor.value = newLineColor;
      }
      // Start transition immediately - MutationObserver runs synchronously
      // when attribute changes, which is exactly when CSS transitions start
      colorTransitionStart = performance.now();
    });
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // Orthographic camera mapping pixels directly
    camera = new THREE.OrthographicCamera(0, containerWidth, 0, containerHeight, -10, 10);
    camera.position.z = 1;
    scene = new THREE.Scene();

    // SVG path data (from newbrain.svg)
    // Load SVG path from newbrain.svg file
    try {
      const response = await fetch('brain/newbrain.svg');
      const svgText = await response.text();
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
      const svgElement = svgDoc.querySelector('svg');
      const pathElement = svgDoc.querySelector('path');
      
      if (pathElement) {
        svgPathD = pathElement.getAttribute('d');
        
        // Extract viewBox from SVG to calculate proper bounding box
        if (svgElement) {
          const viewBox = svgElement.getAttribute('viewBox');
          if (viewBox) {
            const [x, y, width, height] = viewBox.split(/\s+/).map(parseFloat);
            // Update bounding box to match new SVG dimensions
            brainBBox = { min: { x: x, y: y }, max: { x: x + width, y: y + height } };
          } else {
            // Fallback: use SVG width/height if viewBox not available
            const svgWidth = parseFloat(svgElement.getAttribute('width')) || 810;
            const svgHeight = parseFloat(svgElement.getAttribute('height')) || 810;
            brainBBox = { min: { x: 0, y: 0 }, max: { x: svgWidth, y: svgHeight } };
          }
        }
      } else {
        throw new Error('No path element found in SVG');
      }
    } catch (error) {
      console.warn('Could not load newbrain.svg, using fallback path:', error);
      // Fallback to original path if loading fails
      svgPathD = "M129.49 114.51C129.121 116.961 128.187 119.293 126.762 121.322C125.337 123.351 123.461 125.021 121.28 126.2C120.676 126.535 120.043 126.816 119.39 127.04C120.22 138.04 102.74 142.04 93.32 139.42L96.82 151.66L87.82 151.98L72.07 129.43C66.76 130.93 60.49 131.65 56.44 125.15C56.0721 124.553 55.7382 123.935 55.44 123.3C54.4098 123.51 53.3614 123.617 52.31 123.62C49.31 123.62 44.31 122.72 41.77 120.96C39.7563 119.625 38.1588 117.75 37.16 115.55C31.75 116.29 27.16 115.02 24.16 111.88C20.36 107.97 19.28 101.51 21.26 94.58C23.87 85.33 31.81 74.91 47.59 71C48.9589 69.2982 50.5972 67.8322 52.44 66.66C62.35 60.31 78.44 59.76 90.65 65.79C95.3836 64.9082 100.27 65.376 104.75 67.14C113.53 70.43 119.91 77.31 121.11 84.3C123.487 85.5317 125.433 87.4568 126.69 89.82C129.32 94.76 129.69 99.71 127.92 103.71C129.587 107.049 130.138 110.835 129.49 114.51ZM123.01 109.31C121.612 110.048 120.056 110.434 118.475 110.434C116.894 110.434 115.338 110.048 113.94 109.31L114.67 104.46C117.75 104.76 120.26 103.8 121.57 101.83C123.04 99.64 122.81 96.39 120.95 92.9C118.87 88.99 114.38 88.37 111.89 88.34H111.73C105.49 88.34 99.13 91.89 96.56 96.52L92.82 94.73C93.5553 92.3449 94.8046 90.15 96.48 88.3C95.0376 87.0754 93.9474 85.4887 93.3217 83.703C92.696 81.9173 92.5574 79.9971 92.92 78.14L96.61 77.8C96.7789 79.302 97.4 80.7172 98.3911 81.8583C99.3822 82.9994 100.697 83.8125 102.16 84.19C105.238 82.8161 108.58 82.1335 111.95 82.19C112.43 82.19 112.89 82.24 113.36 82.27C110.969 78.0312 107.18 74.7545 102.64 73C91.56 68.7 84.09 75.37 82.38 77.67C78.26 83.19 80.9 88.41 82.91 91.8L79.61 94.8C76.736 92.314 74.8075 88.9127 74.15 85.17C69.92 86.44 64.24 86.17 61.06 80.74L64.06 78.68C67.43 81.2 72.78 80.98 75.32 77.87C75.9252 76.4949 76.6905 75.1959 77.6 74C79.044 72.093 80.7864 70.4316 82.76 69.08C74.47 66.82 62.76 67.19 55.68 71.73C53.7668 72.841 52.192 74.4517 51.1244 76.3895C50.0569 78.3274 49.5368 80.5192 49.62 82.73C49.62 86.3 52.42 91.94 56.19 92.82L54 97.07C51.5946 96.5129 49.4109 95.2487 47.73 93.44L44.48 97.58L41.23 96L44.41 87.68C43.8904 86.064 43.624 84.3774 43.62 82.68C43.628 81.3361 43.7687 79.9963 44.04 78.68C34.04 82.81 29.1 89.68 27.29 95.96C25.9 100.79 26.44 105.15 28.72 107.49C30.53 109.35 33.3 109.79 35.91 109.62L42.91 104.17L45.21 106.11L43.13 112.93C44.22 116.4 47.79 118.19 54.3 116.93C54.6375 114.169 55.7272 111.554 57.45 109.37C58.7133 107.552 60.3846 106.056 62.33 105L65.75 95.79L69.17 95.64L68.8 103.19C74.55 102.6 80.98 103.77 86.97 102.87L88.07 106.87C79.29 110.93 70.3 104.31 62.15 113.04C59.22 116.18 60.34 118.91 62.15 121.66C64.76 125.59 69.66 123.23 74.67 121.66C82.26 119.34 87.77 117.66 98.16 118.51C95.68 113.8 95.92 108.11 99.24 101.85L104.13 103.78C100.7 111.69 103.91 116.27 106.13 118.29C109.56 121.41 114.72 122.35 118.13 120.47C119.436 119.749 120.559 118.737 121.412 117.513C122.265 116.289 122.825 114.885 123.05 113.41C123.275 112.051 123.258 110.663 123 109.31H123.01Z";
      brainBBox = { min: { x: -20, y: 0 }, max: { x: 170, y: 190 } };
    }
    path2D = new Path2D(svgPathD);
    offscreen = document.createElement('canvas').getContext('2d');
    offscreen.canvas.width = 1024;
    offscreen.canvas.height = 1024;

    buildPoints();

    // Use ResizeObserver for container size changes
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        updateContainerSize();
        onResize();
      });
      resizeObserver.observe(containerEl);
    } else {
      window.addEventListener('resize', onResize);
    }

    renderer.domElement.addEventListener('pointerenter', () => { pointer.inside = true; });
    renderer.domElement.addEventListener('pointerleave', () => { pointer.inside = false; pointer.x = -1e9; pointer.y = -1e9; });
    renderer.domElement.addEventListener('pointermove', (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    });

    animate();
  }

  function updateContainerSize() {
    if (containerEl) {
      const rect = containerEl.getBoundingClientRect();
      containerWidth = rect.width;
      containerHeight = rect.height;
    }
  }

  function computeBrainTransform() {
    const bbox = brainBBox || { min: { x: -20, y: 0 }, max: { x: 170, y: 190 } };
    const w = bbox.max.x - bbox.min.x;
    const h = bbox.max.y - bbox.min.y;
    
    // Scale to fit within the 48% canvas width
    const scaleX = containerWidth / w;
    const scaleY = containerHeight / h;
    // Use width-based scale with a tiny reduction to ensure it fits perfectly
    const scale = scaleX * 0.98; // Reduce by 2% to fit within canvas
    
    const scaledW = w * scale;
    const scaledH = h * scale;
    
    // Align left edge perfectly (no horizontal centering)
    const offsetX = Math.floor(-bbox.min.x * scale);
    // Center vertically
    const offsetY = Math.floor((containerHeight - scaledH) / 2 - bbox.min.y * scale);
    
    brainTransform = { scale, offsetX, offsetY };
    
    // Brain now fits within the 48% canvas width
  }

  // Check if a position is too close to existing dots (optimized with squared distance)
  function isTooClose(x, y, existingPositions, count) {
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const ex = existingPositions[i3 + 0];
      const ey = existingPositions[i3 + 1];
      const dx = x - ex;
      const dy = y - ey;
      const distSq = dx * dx + dy * dy; // Use squared distance to avoid sqrt
      if (distSq < MIN_DISTANCE_SQ) {
        return true;
      }
    }
    return false;
  }

  function buildPoints() {
    computeBrainTransform();
    renderedDotsLogged = false; // Reset so we log again after rebuild

    positions = new Float32Array(NUM_DOTS * 3);
    basePositions = new Float32Array(NUM_DOTS * 3);
    sizes = new Float32Array(NUM_DOTS);
    targetSizes = new Float32Array(NUM_DOTS);
    baseSizes = new Float32Array(NUM_DOTS);
    phases = new Float32Array(NUM_DOTS);
    driftDirs = new Float32Array(NUM_DOTS * 2);
    driftAmps = new Float32Array(NUM_DOTS);
    driftSpeeds = new Float32Array(NUM_DOTS);

    const bbox = brainBBox;
    const w = (bbox.max.x - bbox.min.x) * brainTransform.scale;
    const h = (bbox.max.y - bbox.min.y) * brainTransform.scale;

    let count = 0;
    let attempts = 0;
    const maxAttempts = NUM_DOTS * 300; // More attempts needed with spacing constraint and more dots
    
    // Gradually relax spacing constraint as we place more dots
    let relaxedDistance = MIN_DISTANCE;
    
    while (count < NUM_DOTS && attempts++ < maxAttempts) {
      const x = brainTransform.offsetX + Math.random() * w;
      const y = brainTransform.offsetY + Math.random() * h;
      if (!isInsideBrain(x, y)) continue;
      
      // Relax spacing gradually as we get more dots (but never below DOT_SIZE to prevent overlap)
      const minAllowedDistance = DOT_SIZE * 1.0; // Never go below dot size
      if (count > NUM_DOTS * 0.8) {
        relaxedDistance = Math.max(MIN_DISTANCE * 0.90, minAllowedDistance); // Slight relaxation for last 20%
      } else if (count > NUM_DOTS * 0.6) {
        relaxedDistance = Math.max(MIN_DISTANCE * 0.95, minAllowedDistance); // Very slight relaxation for last 40%
      }
      
      // Check spacing with potentially relaxed distance
      let tooClose = false;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const ex = positions[i3 + 0];
        const ey = positions[i3 + 1];
        const dx = x - ex;
        const dy = y - ey;
        const distSq = dx * dx + dy * dy;
        if (distSq < relaxedDistance * relaxedDistance) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;
      const i3 = count * 3;
      positions[i3 + 0] = x;
      basePositions[i3 + 0] = x;
      positions[i3 + 1] = y;
      basePositions[i3 + 1] = y;
      positions[i3 + 2] = 0;
      basePositions[i3 + 2] = 0;
      // All dots same size
      baseSizes[count] = DOT_SIZE;
      sizes[count] = DOT_SIZE;
      targetSizes[count] = DOT_SIZE;
      phases[count] = Math.random() * Math.PI * 2;
      const ang = Math.random() * Math.PI * 2;
      driftDirs[count * 2 + 0] = Math.cos(ang);
      driftDirs[count * 2 + 1] = Math.sin(ang);
      driftAmps[count] = 6 + Math.random() * 8;
      driftSpeeds[count] = 0.25 + Math.random() * 0.20;
      count++;
    }

    // Fallback if needed - also with spacing check
    const cx = containerWidth * 0.5;
    const cy = containerHeight * 0.5;
    while (count < NUM_DOTS && attempts++ < maxAttempts * 2) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() ** 0.7 * Math.min(w, h) * 0.4;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (!isInsideBrain(x, y)) continue;
      if (isTooClose(x, y, positions, count)) continue;
      const i3 = count * 3;
      positions[i3 + 0] = x;
      basePositions[i3 + 0] = x;
      positions[i3 + 1] = y;
      basePositions[i3 + 1] = y;
      positions[i3 + 2] = 0;
      basePositions[i3 + 2] = 0;
      // All dots same size
      baseSizes[count] = DOT_SIZE;
      sizes[count] = DOT_SIZE;
      targetSizes[count] = DOT_SIZE;
      phases[count] = Math.random() * Math.PI * 2;
      const ang2 = Math.random() * Math.PI * 2;
      driftDirs[count * 2 + 0] = Math.cos(ang2);
      driftDirs[count * 2 + 1] = Math.sin(ang2);
      driftAmps[count] = 6 + Math.random() * 8;
      driftSpeeds[count] = 0.25 + Math.random() * 0.20;
      count++;
    }

    // Log how many dots were actually placed with detailed info
    const placementRate = ((count / NUM_DOTS) * 100).toFixed(1);
    console.log(`Brain dots: Placed ${count} out of ${NUM_DOTS} dots (${placementRate}%)`);
    if (count < NUM_DOTS * 0.9) {
      console.warn(`Warning: Only ${placementRate}% of dots were placed. Consider reducing MIN_DISTANCE or DOT_SIZE.`);
    }

    // Initialize remaining unplaced dots to a position far off-screen to prevent rendering artifacts
    // Place them outside the visible area (negative coordinates)
    for (let i = count; i < NUM_DOTS; i++) {
      const i3 = i * 3;
      positions[i3 + 0] = -1000; // Far off-screen
      positions[i3 + 1] = -1000;
      positions[i3 + 2] = 0;
      basePositions[i3 + 0] = -1000;
      basePositions[i3 + 1] = -1000;
      basePositions[i3 + 2] = 0;
      sizes[i] = 0; // Make invisible
      baseSizes[i] = 0;
      targetSizes[i] = 0;
    }
    
    geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    // Create material with initial dot color based on theme
    const isDarkMode = document.body.classList.contains('dark-mode');
    const initialDotColor = isDarkMode 
      ? new THREE.Color(1.0, 1.0, 1.0) // White in dark mode
      : new THREE.Color(0.0, 0.0, 0.0); // Black in light mode
    
    material = new THREE.ShaderMaterial({
      transparent: true,
      depthTest: false,
      blending: THREE.NormalBlending,
      uniforms: {
        uColor: { value: initialDotColor },
        uFeather: { value: 0.0 },
      },
      vertexShader: `
        precision mediump float;
        attribute float aSize;
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize;
        }
      `,
      fragmentShader: `
        precision mediump float;
        uniform vec3 uColor;
        uniform float uFeather;
        void main() {
          vec2 uv = gl_PointCoord * 2.0 - 1.0;
          float r2 = dot(uv, uv);
          if (r2 > 1.0) discard;
          float feather = clamp(uFeather, 0.0, 0.5);
          float alpha = feather > 0.0 ? smoothstep(1.0, 1.0 - feather, 1.0 - r2) : 1.0;
          gl_FragColor = vec4(uColor, alpha);
        }
      `
    });

    if (points) scene.remove(points);
    points = new THREE.Points(geometry, material);
    scene.add(points);
    
    // Initialize line connections
    initLineConnections();
  }
  
  function initLineConnections() {
    // Remove existing line segments if they exist
    if (lineSegments && scene) {
      scene.remove(lineSegments);
    }
    
    // Create line geometry with quads (4 vertices per line for thickness)
    // Each line needs 4 vertices to form a quad (rectangle)
    linePositions = new Float32Array(MAX_LINES * 4 * 3); // 4 vertices per line, 3 coords per vertex
    lineOpacities = new Float32Array(MAX_LINES * 4); // One opacity per vertex
    lineTargetOpacities = new Float32Array(MAX_LINES);
    
    // Create indices for quads (2 triangles per quad)
    const indices = new Uint16Array(MAX_LINES * 6); // 6 indices per quad (2 triangles)
    for (let i = 0; i < MAX_LINES; i++) {
      const base = i * 4;
      const idxBase = i * 6;
      // First triangle
      indices[idxBase + 0] = base + 0;
      indices[idxBase + 1] = base + 1;
      indices[idxBase + 2] = base + 2;
      // Second triangle
      indices[idxBase + 3] = base + 1;
      indices[idxBase + 4] = base + 3;
      indices[idxBase + 5] = base + 2;
    }
    
    lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('opacity', new THREE.BufferAttribute(lineOpacities, 1));
    lineGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
    
    // Create line material with smooth fading
    // White lines in dark mode, black lines in light mode
    const isDarkMode = document.body.classList.contains('dark-mode');
    const lineColor = isDarkMode 
      ? new THREE.Color(1.0, 1.0, 1.0) // White in dark mode
      : new THREE.Color(0.0, 0.0, 0.0); // Black in light mode
    
    lineMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthTest: false,
      blending: THREE.NormalBlending,
      uniforms: {
        uColor: { value: lineColor },
        uResolution: { value: new THREE.Vector2(containerWidth, containerHeight) },
        uLineWidth: { value: LINE_WIDTH }
      },
      vertexShader: `
        precision mediump float;
        attribute float opacity;
        varying float vOpacity;
        void main() {
          vOpacity = opacity;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision mediump float;
        uniform vec3 uColor;
        varying float vOpacity;
        void main() {
          // Use high opacity for proper white/black color (not grey)
          gl_FragColor = vec4(uColor, vOpacity);
        }
      `
    });
    
    lineSegments = new THREE.Mesh(lineGeometry, lineMaterial);
    scene.add(lineSegments);
    
    // Initialize all opacities to 0
    for (let i = 0; i < MAX_LINES; i++) {
      lineTargetOpacities[i] = 0;
    }
    for (let i = 0; i < MAX_LINES * 4; i++) {
      lineOpacities[i] = 0;
    }
  }

  function isInsideBrain(x, y) {
    const lx = (x - brainTransform.offsetX) / brainTransform.scale;
    const ly = (y - brainTransform.offsetY) / brainTransform.scale;
    offscreen.save();
    const inside = offscreen.isPointInPath(path2D, lx, ly, 'evenodd');
    offscreen.restore();
    return inside;
  }

  function onResize() {
    updateContainerSize();
    if (renderer && containerWidth > 0 && containerHeight > 0) {
      renderer.setSize(containerWidth, containerHeight);
      camera.left = 0;
      camera.right = containerWidth;
      camera.top = 0;
      camera.bottom = containerHeight;
      camera.updateProjectionMatrix();
      buildPoints();
      // Lines are reinitialized in buildPoints() via initLineConnections()
    }
  }

  function animate() {
    requestAnimationFrame(animate);

    if (!renderer || !scene || !camera) return;

    const now = performance.now() * 0.001;
    let moved = false;
    const DRIFT_EASE = 0.065;
    const MAX_STEP = 1.6;
    const breath = 1.0; // Disable breathing animation

    // Count how many dots are actually being rendered (not off-screen)
    let visibleDotsCount = 0;

    for (let i = 0; i < NUM_DOTS; i++) {
      // Skip dots that are off-screen (uninitialized)
      const i3 = i * 3;
      if (positions[i3 + 0] < -500) continue;
      visibleDotsCount++;
      const bx = basePositions[i3 + 0];
      const by = basePositions[i3 + 1];
      // Disable drift animation - dots stay at base position
      let nx = bx;
      let ny = by;
      
      // Dramatic gravitational pull toward mouse position
      if (pointer.inside) {
        const GRAVITY_STRENGTH = 2.5; // Very strong gravitational pull for dramatic effect
        const MAX_GRAVITY_DISTANCE = 500; // Maximum distance for gravity effect (wider range)
        const MAX_GRAVITY_DISTANCE_SQ = MAX_GRAVITY_DISTANCE * MAX_GRAVITY_DISTANCE;
        
        const dxToMouse = pointer.x - nx;
        const dyToMouse = pointer.y - ny;
        const distToMouseSq = dxToMouse * dxToMouse + dyToMouse * dyToMouse;
        
        // Use squared distance check to avoid expensive Math.sqrt
        if (distToMouseSq > 0 && distToMouseSq < MAX_GRAVITY_DISTANCE_SQ) {
          // Calculate gravitational pull (stronger when closer, weaker when farther)
          // Use inverse square law for more dramatic effect
          const normalizedDistSq = distToMouseSq / MAX_GRAVITY_DISTANCE_SQ;
          const normalizedDist = Math.sqrt(normalizedDistSq); // Only calculate sqrt once when needed
          const inverseSquareFactor = 1.0 / (normalizedDistSq + 0.1); // Inverse square with smoothing
          const gravityFactor = (1.0 - normalizedDist) * GRAVITY_STRENGTH * (1.0 + inverseSquareFactor * 0.3); // More dramatic falloff
          
          // Apply subtle pull toward mouse (use squared distance for direction)
          const invDist = 1.0 / Math.sqrt(distToMouseSq); // Only calculate once
          const pullX = dxToMouse * invDist * gravityFactor;
          const pullY = dyToMouse * invDist * gravityFactor;
          
          nx += pullX;
          ny += pullY;
          
          // Make sure still inside brain after gravity
          if (!isInsideBrain(nx, ny)) {
            // If gravity pulls outside, reduce the pull
            nx -= pullX * 0.5;
            ny -= pullY * 0.5;
            if (!isInsideBrain(nx, ny)) {
              // Fallback to original position if still outside
              nx = bx + ox;
              ny = by + oy;
            }
          }
        }
      }
      
      const cx = positions[i3 + 0];
      const cy = positions[i3 + 1];
      let sx = cx + (nx - cx) * DRIFT_EASE;
      let sy = cy + (ny - cy) * DRIFT_EASE;
      const vx = sx - cx;
      const vy = sy - cy;
      const vlen = Math.hypot(vx, vy);
      if (vlen > MAX_STEP) {
        const s = MAX_STEP / vlen;
        sx = cx + vx * s;
        sy = cy + vy * s;
      }
      
      // Collision detection to prevent overlap (optimized - only check nearby dots)
      const currentDotRadius = sizes[i] * 0.5; // Current radius of this dot
      const collisionCheckRadius = Math.max(DOT_SIZE, sizes[i]) * 2.0; // Check within 2x radius
      const collisionCheckRadiusSq = collisionCheckRadius * collisionCheckRadius;
      
      // Only check collisions with nearby dots (spatial optimization)
      let collisionX = 0;
      let collisionY = 0;
      let collisionCount = 0;
      const MAX_COLLISION_CHECKS = 20; // Limit checks per dot for performance
      let checksPerformed = 0;
      
      for (let j = 0; j < NUM_DOTS && checksPerformed < MAX_COLLISION_CHECKS; j++) {
        if (i === j) continue; // Skip self
        const j3 = j * 3;
        if (positions[j3 + 0] < -500) continue; // Skip off-screen dots
        
        const dx = sx - positions[j3 + 0];
        const dy = sy - positions[j3 + 1];
        const distSq = dx * dx + dy * dy;
        
        // Only check if within collision check radius
        if (distSq < collisionCheckRadiusSq && distSq > 0) {
          checksPerformed++;
          const otherDotRadius = sizes[j] * 0.5;
          const minDist = currentDotRadius + otherDotRadius;
          const minDistSq = minDist * minDist;
          
          // If too close, push away
          if (distSq < minDistSq) {
            const dist = Math.sqrt(distSq);
            const overlap = minDist - dist;
            const pushStrength = overlap * 0.25; // Gentle push to prevent overlap
            const pushX = (dx / dist) * pushStrength;
            const pushY = (dy / dist) * pushStrength;
            collisionX += pushX;
            collisionY += pushY;
            collisionCount++;
          }
        }
      }
      
      // Apply collision resolution (average of all collisions)
      if (collisionCount > 0) {
        sx += collisionX;
        sy += collisionY;
      }
      
      // Ensure dot stays within canvas bounds and brain shape
      if (sx < 0 || sx > containerWidth || sy < 0 || sy > containerHeight || !isInsideBrain(sx, sy)) {
        sx = bx;
        sy = by;
      }
      
      if (cx !== sx || cy !== sy) moved = true;
      positions[i3 + 0] = sx;
      positions[i3 + 1] = sy;
    }
    if (moved && geometry) geometry.attributes.position.needsUpdate = true;
    
    // Log rendered dots count once after initialization
    if (!renderedDotsLogged && visibleDotsCount > 0) {
      renderedDotsCount = visibleDotsCount;
      const renderRate = ((renderedDotsCount / NUM_DOTS) * 100).toFixed(1);
      console.log(`Brain dots: Actually rendering ${renderedDotsCount} out of ${NUM_DOTS} dots (${renderRate}%)`);
      renderedDotsLogged = true;
    }

    // Always keep canvas transparent in both light and dark mode
    if (renderer) {
      renderer.setClearColor(0x000000, 0); // Always transparent - never opaque
    }
    
    // Update dot color transitions to match CSS transition timing
    if (colorTransitionStart !== null && material) {
      const elapsed = performance.now() - colorTransitionStart;
      const progress = Math.min(elapsed / COLOR_TRANSITION_DURATION, 1.0);
      
      // Proper cubic-bezier function for CSS "ease"
      function cubicBezierEase(t) {
        let start = 0, end = 1;
        for (let i = 0; i < 14; i++) {
          const mid = (start + end) / 2;
          const x = 3 * mid * (1 - mid) * (1 - mid) * 0.25 + 3 * mid * mid * (1 - mid) * 0.25 + mid * mid * mid;
          if (x < t) start = mid;
          else end = mid;
        }
        const t2 = (start + end) / 2;
        return 3 * t2 * (1 - t2) * (1 - t2) * 0.1 + 3 * t2 * t2 * (1 - t2) * 1.0 + t2 * t2 * t2;
      }
      
      const eased = cubicBezierEase(progress);
      
      // Interpolate dot color
      currentDotColor.r = startDotColor.r + (targetDotColor.r - startDotColor.r) * eased;
      currentDotColor.g = startDotColor.g + (targetDotColor.g - startDotColor.g) * eased;
      currentDotColor.b = startDotColor.b + (targetDotColor.b - startDotColor.b) * eased;
      
      // Update dot color in material
      material.uniforms.uColor.value.setRGB(currentDotColor.r, currentDotColor.g, currentDotColor.b);
      
      // Update line color to match dot color (white in dark mode, black in light mode)
      if (lineMaterial) {
        lineMaterial.uniforms.uColor.value.setRGB(currentDotColor.r, currentDotColor.g, currentDotColor.b);
      }
      
      // Reset transition if complete
      if (progress >= 1.0) {
        currentDotColor = { ...targetDotColor };
        // Ensure final color is set correctly
        material.uniforms.uColor.value.setRGB(currentDotColor.r, currentDotColor.g, currentDotColor.b);
        if (lineMaterial) {
          lineMaterial.uniforms.uColor.value.setRGB(currentDotColor.r, currentDotColor.g, currentDotColor.b);
        }
        colorTransitionStart = null;
      }
    } else {
      // If no transition is active, ensure dots match current theme
      const isDark = document.body.classList.contains('dark-mode');
      const expectedDotColor = isDark 
        ? { r: 1.0, g: 1.0, b: 1.0 } // White in dark mode
        : { r: 0.0, g: 0.0, b: 0.0 }; // Black in light mode
      
      // Check if current color matches expected (with small tolerance)
      const colorDiff = Math.abs(currentDotColor.r - expectedDotColor.r) + 
                       Math.abs(currentDotColor.g - expectedDotColor.g) + 
                       Math.abs(currentDotColor.b - expectedDotColor.b);
      
      if (colorDiff > 0.01 && material) {
        // Update to match expected color
        currentDotColor = { ...expectedDotColor };
        material.uniforms.uColor.value.setRGB(currentDotColor.r, currentDotColor.g, currentDotColor.b);
        if (lineMaterial) {
          lineMaterial.uniforms.uColor.value.setRGB(currentDotColor.r, currentDotColor.g, currentDotColor.b);
        }
      }
    }

    updateBackgroundGradient(now);

    const minDim = Math.min(containerWidth, containerHeight);
    const sigma = Math.max(8, minDim * 0.03);
    const maxBoost = 15;

    if (!pointer.inside) {
      for (let i = 0; i < NUM_DOTS; i++) {
        if (positions[i * 3 + 0] < -500) continue; // Skip off-screen
        targetSizes[i] = DOT_SIZE;
      }
    } else {
      const inv2Sigma2 = 1.0 / (2.0 * sigma * sigma);
      for (let i = 0; i < NUM_DOTS; i++) {
        if (positions[i * 3 + 0] < -500) continue; // Skip off-screen
        const ix = positions[i * 3 + 0];
        const iy = positions[i * 3 + 1];
        const dx = ix - pointer.x;
        const dy = iy - pointer.y;
        const dist2 = dx * dx + dy * dy;
        const w = Math.exp(-dist2 * inv2Sigma2);
        targetSizes[i] = DOT_SIZE + maxBoost * w;
      }
    }

    let anyChange = false;
    for (let i = 0; i < NUM_DOTS; i++) {
      if (positions[i * 3 + 0] < -500) continue; // Skip off-screen
      const s = sizes[i];
      const ts = targetSizes[i];
      const ns = s + (ts - s) * EASE;
      if (Math.abs(ns - s) > 0.001) anyChange = true;
      sizes[i] = ns;
    }
    if (anyChange && geometry) geometry.attributes.aSize.needsUpdate = true;

    // Update line connections between expanded dots
    updateLineConnections();

    renderer.render(scene, camera);
  }
  
  function updateLineConnections() {
    if (!lineGeometry || !pointer.inside) {
      // Fade out all lines when not hovering
      let needsUpdate = false;
      for (let i = 0; i < MAX_LINES; i++) {
        if (lineTargetOpacities[i] > 0) {
          lineTargetOpacities[i] = 0;
          needsUpdate = true;
        }
      }
      if (needsUpdate) {
        animateLineOpacities();
      }
      return;
    }
    
    // Collect expanded dots (dots above threshold size)
    const expandedDots = [];
    for (let i = 0; i < NUM_DOTS; i++) {
      const i3 = i * 3;
      if (positions[i3 + 0] < -500) continue; // Skip off-screen
      if (sizes[i] >= EXPANDED_SIZE_THRESHOLD) {
        expandedDots.push({
          index: i,
          x: positions[i3 + 0],
          y: positions[i3 + 1],
          z: positions[i3 + 2],
          size: sizes[i]
        });
      }
    }
    
    // Collect nearby non-expanded dots (one level further out)
    // These are dots that are near expanded dots but not expanded themselves
    const nearbyDots = [];
    const EXPANDED_RADIUS = MAX_ONE_LEVEL_OUT_DISTANCE * 1.2; // Look for nearby dots within this radius
    const EXPANDED_RADIUS_SQ = EXPANDED_RADIUS * EXPANDED_RADIUS;
    
    for (let i = 0; i < NUM_DOTS; i++) {
      const i3 = i * 3;
      if (positions[i3 + 0] < -500) continue; // Skip off-screen
      if (sizes[i] >= EXPANDED_SIZE_THRESHOLD) continue; // Skip already expanded dots
      
      // Check if this dot is near any expanded dot
      const x = positions[i3 + 0];
      const y = positions[i3 + 1];
      let isNearExpanded = false;
      
      for (let j = 0; j < expandedDots.length; j++) {
        const expDot = expandedDots[j];
        const dx = x - expDot.x;
        const dy = y - expDot.y;
        const distSq = dx * dx + dy * dy;
        if (distSq <= EXPANDED_RADIUS_SQ) {
          isNearExpanded = true;
          break;
        }
      }
      
      if (isNearExpanded) {
        nearbyDots.push({
          index: i,
          x: x,
          y: positions[i3 + 1],
          z: positions[i3 + 2],
          size: sizes[i]
        });
      }
    }
    
    // Reset all line target opacities
    for (let i = 0; i < MAX_LINES; i++) {
      lineTargetOpacities[i] = 0;
    }
    
    // Helper function to create a connection
    function createConnection(dot1, dot2, maxDistance, opacityMultiplier = 1.0) {
      if (lineIndex >= MAX_LINES) return false;
      
      const dx = dot2.x - dot1.x;
      const dy = dot2.y - dot1.y;
      const distSq = dx * dx + dy * dy;
      const maxDistSq = maxDistance * maxDistance;
      
      if (distSq > maxDistSq) return false;
      
      // Create connection as a quad (thick line)
      const lineIdx = lineIndex * 4 * 3; // 4 vertices per line
      
      // Calculate line direction and perpendicular
      const dist = Math.sqrt(distSq);
      
      // Normalize direction
      const nx = dx / dist;
      const ny = dy / dist;
      
      // Perpendicular vector for line width
      const perpX = -ny;
      const perpY = nx;
      
      // Half width in pixels
      const halfWidth = LINE_WIDTH * 0.5;
      
      // Create quad vertices (4 corners of the line rectangle)
      // Top-left
      linePositions[lineIdx + 0] = dot1.x + perpX * halfWidth;
      linePositions[lineIdx + 1] = dot1.y + perpY * halfWidth;
      linePositions[lineIdx + 2] = dot1.z;
      
      // Top-right
      linePositions[lineIdx + 3] = dot2.x + perpX * halfWidth;
      linePositions[lineIdx + 4] = dot2.y + perpY * halfWidth;
      linePositions[lineIdx + 5] = dot2.z;
      
      // Bottom-left
      linePositions[lineIdx + 6] = dot1.x - perpX * halfWidth;
      linePositions[lineIdx + 7] = dot1.y - perpY * halfWidth;
      linePositions[lineIdx + 8] = dot1.z;
      
      // Bottom-right
      linePositions[lineIdx + 9] = dot2.x - perpX * halfWidth;
      linePositions[lineIdx + 10] = dot2.y - perpY * halfWidth;
      linePositions[lineIdx + 11] = dot2.z;
      
      // Calculate opacity based on distance (closer = more opaque)
      const normalizedDist = dist / maxDistance;
      // Use higher base opacity for more solid lines, with slight fade based on distance
      const opacity = (0.95 - (normalizedDist * 0.2)) * opacityMultiplier;
      
      lineTargetOpacities[lineIndex] = opacity;
      lineIndex++;
      return true;
    }
    
    let lineIndex = 0;
    
    // 1. Connect expanded dots to each other (PRIORITIZED - original behavior)
    // Collect all possible expanded-to-expanded connections first
    const expandedConnections = [];
    for (let i = 0; i < expandedDots.length; i++) {
      const dot1 = expandedDots[i];
      for (let j = i + 1; j < expandedDots.length; j++) {
        const dot2 = expandedDots[j];
        const dx = dot2.x - dot1.x;
        const dy = dot2.y - dot1.y;
        const distSq = dx * dx + dy * dy;
        const MAX_CONNECTION_DISTANCE_SQ = MAX_CONNECTION_DISTANCE * MAX_CONNECTION_DISTANCE;
        
        if (distSq <= MAX_CONNECTION_DISTANCE_SQ) {
          const dist = Math.sqrt(distSq);
          expandedConnections.push({
            dot1: dot1,
            dot2: dot2,
            distance: dist
          });
        }
      }
    }
    
    // Sort by distance (closer connections first) for better visual quality
    expandedConnections.sort((a, b) => a.distance - b.distance);
    
    // Create connections up to MAX_CONNECTIONS, prioritizing expanded-to-expanded
    for (let i = 0; i < expandedConnections.length && lineIndex < MAX_CONNECTIONS; i++) {
      const conn = expandedConnections[i];
      createConnection(conn.dot1, conn.dot2, MAX_CONNECTION_DISTANCE, 1.0);
    }
    
    // 2. Connect expanded dots to nearby non-expanded dots (one level further out, with distance limit)
    // Only add these if we haven't reached MAX_CONNECTIONS yet
    if (lineIndex < MAX_CONNECTIONS) {
      const oneLevelOutConnections = [];
      for (let i = 0; i < expandedDots.length; i++) {
        const expDot = expandedDots[i];
        for (let j = 0; j < nearbyDots.length; j++) {
          const nearbyDot = nearbyDots[j];
          const dx = nearbyDot.x - expDot.x;
          const dy = nearbyDot.y - expDot.y;
          const distSq = dx * dx + dy * dy;
          const MAX_ONE_LEVEL_OUT_DISTANCE_SQ = MAX_ONE_LEVEL_OUT_DISTANCE * MAX_ONE_LEVEL_OUT_DISTANCE;
          
          if (distSq <= MAX_ONE_LEVEL_OUT_DISTANCE_SQ) {
            const dist = Math.sqrt(distSq);
            oneLevelOutConnections.push({
              dot1: expDot,
              dot2: nearbyDot,
              distance: dist
            });
          }
        }
      }
      
      // Sort by distance (closer connections first)
      oneLevelOutConnections.sort((a, b) => a.distance - b.distance);
      
      // Add one-level-out connections only if we have room
      for (let i = 0; i < oneLevelOutConnections.length && lineIndex < MAX_CONNECTIONS; i++) {
        const conn = oneLevelOutConnections[i];
        createConnection(conn.dot1, conn.dot2, MAX_ONE_LEVEL_OUT_DISTANCE, 0.75);
      }
    }
    
    // Update geometry if we have lines
    if (lineIndex > 0) {
      // For indexed geometry, draw range is in terms of indices (6 per quad)
      lineGeometry.setDrawRange(0, lineIndex * 6);
      lineGeometry.attributes.position.needsUpdate = true;
    } else {
      lineGeometry.setDrawRange(0, 0);
    }
    
    // Animate line opacities smoothly
    animateLineOpacities();
  }
  
  function animateLineOpacities() {
    if (!lineGeometry) return;
    
    // Smooth easing function for natural animation
    // Ease-out for smooth deceleration (feels more natural)
    function easeOut(t) {
      return 1 - Math.pow(1 - t, 3);
    }
    
    const LINE_EASE = 0.08; // Slower for smoother, more gradual transitions
    let needsUpdate = false;
    
    for (let i = 0; i < MAX_LINES; i++) {
      const target = lineTargetOpacities[i];
      const current = lineOpacities[i * 4]; // All 4 vertices have same opacity
      
      // Calculate progress towards target
      const diff = target - current;
      const absDiff = Math.abs(diff);
      
      if (absDiff > 0.001) {
        // Calculate normalized progress (0 to 1) based on how far we are from target
        // Use a larger range for smoother transitions
        const progress = Math.min(absDiff / 1.0, 1.0);
        
        // Apply smooth ease-out easing for natural deceleration
        const easedProgress = easeOut(progress);
        
        // Calculate step size with easing - faster when far, slower when close
        const baseStep = diff * LINE_EASE;
        const easedStep = baseStep * (0.3 + easedProgress * 0.7); // Smoother acceleration/deceleration
        
        const newOpacity = current + easedStep;
        
        // Clamp to target to prevent overshooting
        const finalOpacity = (diff > 0) 
          ? Math.min(newOpacity, target)
          : Math.max(newOpacity, target);
        
        // Update all 4 vertices of this line
        const base = i * 4;
        lineOpacities[base + 0] = finalOpacity;
        lineOpacities[base + 1] = finalOpacity;
        lineOpacities[base + 2] = finalOpacity;
        lineOpacities[base + 3] = finalOpacity;
        needsUpdate = true;
      }
    }
    
    if (needsUpdate) {
      lineGeometry.attributes.opacity.needsUpdate = true;
    }
  }

  function clamp01(v) {
    return Math.max(0, Math.min(1, v));
  }

  function updateBackgroundGradient(now) {
    if (!bgEl) return;
    const ease = 0.18;
    let tx = gradState.x;
    let ty = gradState.y;
    let tt = gradState.t;
    
    if (pointer.inside) {
      const bx0 = brainTransform.offsetX;
      const by0 = brainTransform.offsetY;
      const bw = (brainBBox.max.x - brainBBox.min.x) * brainTransform.scale;
      const bh = (brainBBox.max.y - brainBBox.min.y) * brainTransform.scale;
      const nx = clamp01((pointer.x - bx0) / Math.max(1, bw));
      const ny = clamp01((pointer.y - by0) / Math.max(1, bh));
      tx += (nx - tx) * ease;
      ty += (ny - ty) * ease;
      tt += (1 - tt) * ease;
    } else {
      tt += (0 - tt) * ease;
    }
    gradState.x = tx;
    gradState.y = ty;
    gradState.t = tt;

    // Simplified gradient - just subtle effect
    if (tt > 0.001) {
      const cx = Math.round(tx * 100);
      const cy = Math.round(ty * 100);
      bgEl.style.background = `radial-gradient(circle at ${cx}% ${cy}%, rgba(0, 0, 0, 0.05), transparent)`;
      bgEl.style.opacity = String(Math.max(0, Math.min(1, 0.3 * tt)));
    } else {
      bgEl.style.background = 'transparent';
      bgEl.style.opacity = '1';
    }
  }
})();

