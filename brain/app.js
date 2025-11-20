const NUM_DOTS = 500;
const BASE_SIZE = 3.0; // px (used as baseline multiplier only)
const MUTED_RED = new THREE.Color('#000000');
const EASE = 0.18;

let renderer, scene, camera;
let positions, basePositions, sizes, targetSizes, baseSizes, phases, driftDirs, driftAmps, driftSpeeds, points, geometry, material;
let brainBBox, brainTransform = { scale: 1, offsetX: 0, offsetY: 0 };
let svgPathD = null;
let path2D = null;
let offscreen = null; // 2D canvas context for isPointInPath
let pointer = { x: -1e9, y: -1e9, inside: false };
let bgEl = null;
let gradState = { x: 0, y: 0, t: 0 }; // eased background focus

init();
animate();

function init() {
  const container = document.getElementById('app');
  bgEl = document.getElementById('bg');

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0); // transparent to reveal gradient background
  container.appendChild(renderer.domElement);

  // Orthographic camera mapping pixels directly
  camera = new THREE.OrthographicCamera(0, window.innerWidth, 0, window.innerHeight, -10, 10);
  camera.position.z = 1;
  scene = new THREE.Scene();

  // Provided SVG path data (from brain-svgrepo-com.svg)
  svgPathD = "M129.49 114.51C129.121 116.961 128.187 119.293 126.762 121.322C125.337 123.351 123.461 125.021 121.28 126.2C120.676 126.535 120.043 126.816 119.39 127.04C120.22 138.04 102.74 142.04 93.32 139.42L96.82 151.66L87.82 151.98L72.07 129.43C66.76 130.93 60.49 131.65 56.44 125.15C56.0721 124.553 55.7382 123.935 55.44 123.3C54.4098 123.51 53.3614 123.617 52.31 123.62C49.31 123.62 44.31 122.72 41.77 120.96C39.7563 119.625 38.1588 117.75 37.16 115.55C31.75 116.29 27.16 115.02 24.16 111.88C20.36 107.97 19.28 101.51 21.26 94.58C23.87 85.33 31.81 74.91 47.59 71C48.9589 69.2982 50.5972 67.8322 52.44 66.66C62.35 60.31 78.44 59.76 90.65 65.79C95.3836 64.9082 100.27 65.376 104.75 67.14C113.53 70.43 119.91 77.31 121.11 84.3C123.487 85.5317 125.433 87.4568 126.69 89.82C129.32 94.76 129.69 99.71 127.92 103.71C129.587 107.049 130.138 110.835 129.49 114.51ZM123.01 109.31C121.612 110.048 120.056 110.434 118.475 110.434C116.894 110.434 115.338 110.048 113.94 109.31L114.67 104.46C117.75 104.76 120.26 103.8 121.57 101.83C123.04 99.64 122.81 96.39 120.95 92.9C118.87 88.99 114.38 88.37 111.89 88.34H111.73C105.49 88.34 99.13 91.89 96.56 96.52L92.82 94.73C93.5553 92.3449 94.8046 90.15 96.48 88.3C95.0376 87.0754 93.9474 85.4887 93.3217 83.703C92.696 81.9173 92.5574 79.9971 92.92 78.14L96.61 77.8C96.7789 79.302 97.4 80.7172 98.3911 81.8583C99.3822 82.9994 100.697 83.8125 102.16 84.19C105.238 82.8161 108.58 82.1335 111.95 82.19C112.43 82.19 112.89 82.24 113.36 82.27C110.969 78.0312 107.18 74.7545 102.64 73C91.56 68.7 84.09 75.37 82.38 77.67C78.26 83.19 80.9 88.41 82.91 91.8L79.61 94.8C76.736 92.314 74.8075 88.9127 74.15 85.17C69.92 86.44 64.24 86.17 61.06 80.74L64.06 78.68C67.43 81.2 72.78 80.98 75.32 77.87C75.9252 76.4949 76.6905 75.1959 77.6 74C79.044 72.093 80.7864 70.4316 82.76 69.08C74.47 66.82 62.76 67.19 55.68 71.73C53.7668 72.841 52.192 74.4517 51.1244 76.3895C50.0569 78.3274 49.5368 80.5192 49.62 82.73C49.62 86.3 52.42 91.94 56.19 92.82L54 97.07C51.5946 96.5129 49.4109 95.2487 47.73 93.44L44.48 97.58L41.23 96L44.41 87.68C43.8904 86.064 43.624 84.3774 43.62 82.68C43.628 81.3361 43.7687 79.9963 44.04 78.68C34.04 82.81 29.1 89.68 27.29 95.96C25.9 100.79 26.44 105.15 28.72 107.49C30.53 109.35 33.3 109.79 35.91 109.62L42.91 104.17L45.21 106.11L43.13 112.93C44.22 116.4 47.79 118.19 54.3 116.93C54.6375 114.169 55.7272 111.554 57.45 109.37C58.7133 107.552 60.3846 106.056 62.33 105L65.75 95.79L69.17 95.64L68.8 103.19C74.55 102.6 80.98 103.77 86.97 102.87L88.07 106.87C79.29 110.93 70.3 104.31 62.15 113.04C59.22 116.18 60.34 118.91 62.15 121.66C64.76 125.59 69.66 123.23 74.67 121.66C82.26 119.34 87.77 117.66 98.16 118.51C95.68 113.8 95.92 108.11 99.24 101.85L104.13 103.78C100.7 111.69 103.91 116.27 106.13 118.29C109.56 121.41 114.72 122.35 118.13 120.47C119.436 119.749 120.559 118.737 121.412 117.513C122.265 116.289 122.825 114.885 123.05 113.41C123.275 112.051 123.258 110.663 123 109.31H123.01Z";
  path2D = new Path2D(svgPathD);
  offscreen = document.createElement('canvas').getContext('2d');
  offscreen.canvas.width = 1024; offscreen.canvas.height = 1024; // size not critical for isPointInPath
  brainBBox = { min: { x: -20, y: 0 }, max: { x: 170, y: 190 } }; // from SVG viewBox

  buildPoints();

  window.addEventListener('resize', onResize);
  renderer.domElement.addEventListener('pointerenter', () => { pointer.inside = true; });
  renderer.domElement.addEventListener('pointerleave', () => { pointer.inside = false; pointer.x = -1e9; pointer.y = -1e9; });
  renderer.domElement.addEventListener('pointermove', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
  });
}

function sampleSvgPath(d, samples = 1024) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  const total = path.getTotalLength();
  const pts = [];
  for (let i = 0; i < samples; i++) {
    const p = path.getPointAtLength((i / samples) * total);
    pts.push({ x: p.x, y: p.y });
  }
  return pts;
}

function computeBrainTransform() {
  const bbox = brainBBox || { min: { x: -20, y: 0 }, max: { x: 170, y: 190 } }; // from SVG viewBox
  const w = bbox.max.x - bbox.min.x;
  const h = bbox.max.y - bbox.min.y;
  const minDim = Math.min(window.innerWidth, window.innerHeight);
  const targetSize = minDim * 0.85;
  const scale = targetSize / Math.max(w, h);
  const scaledW = w * scale;
  const scaledH = h * scale;
  const offsetX = Math.floor((window.innerWidth - scaledW) / 2 - bbox.min.x * scale);
  const offsetY = Math.floor((window.innerHeight - scaledH) / 2 - bbox.min.y * scale);
  brainTransform = { scale, offsetX, offsetY };
}

function buildPoints() {
  computeBrainTransform();

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

  let count = 0; let attempts = 0; const maxAttempts = NUM_DOTS * 50;
  while (count < NUM_DOTS && attempts++ < maxAttempts) {
    const x = brainTransform.offsetX + Math.random() * w;
    const y = brainTransform.offsetY + Math.random() * h;
    if (!isInsideBrain(x, y)) continue;
    const i3 = count * 3;
    positions[i3 + 0] = x; basePositions[i3 + 0] = x;
    positions[i3 + 1] = y; basePositions[i3 + 1] = y;
    positions[i3 + 2] = 0; basePositions[i3 + 2] = 0;
    const base = 10.0 + Math.random() * 14.0; // random base size per dot (10..24 px)
    baseSizes[count] = base;
    sizes[count] = base;
    targetSizes[count] = base;
    phases[count] = Math.random() * Math.PI * 2;
    const ang = Math.random() * Math.PI * 2;
    driftDirs[count*2+0] = Math.cos(ang);
    driftDirs[count*2+1] = Math.sin(ang);
    driftAmps[count] = 8 + Math.random() * 10;      // lively: 8..18 px
    driftSpeeds[count] = 0.25 + Math.random() * 0.20; // slightly slower: 0.25..0.45 rad/s
    count++;
  }

  // Fallback if needed
  const cx = window.innerWidth * 0.5, cy = window.innerHeight * 0.5;
  while (count < NUM_DOTS) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() ** 0.7 * Math.min(w, h) * 0.4;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    const i3 = count * 3;
    positions[i3 + 0] = x; basePositions[i3 + 0] = x;
    positions[i3 + 1] = y; basePositions[i3 + 1] = y;
    positions[i3 + 2] = 0; basePositions[i3 + 2] = 0;
    const base = 10.0 + Math.random() * 14.0;
    baseSizes[count] = base; sizes[count] = base; targetSizes[count] = base;
    phases[count] = Math.random() * Math.PI * 2;
    const ang2 = Math.random() * Math.PI * 2;
    driftDirs[count*2+0] = Math.cos(ang2);
    driftDirs[count*2+1] = Math.sin(ang2);
    driftAmps[count] = 8 + Math.random() * 10;
    driftSpeeds[count] = 0.25 + Math.random() * 0.20;
    count++;
  }

  geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

  material = new THREE.ShaderMaterial({
    transparent: true,
    depthTest: false,
    blending: THREE.NormalBlending,
    uniforms: {
      uColor: { value: MUTED_RED },
      uFeather: { value: 0.0 }, // 0 = crisp edge, >0 adds soft edge
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
        // Feather controls soft edge amount on white bg; 0.0 = crisp
        float feather = clamp(uFeather, 0.0, 0.5);
        float alpha = feather > 0.0 ? smoothstep(1.0, 1.0 - feather, 1.0 - r2) : 1.0;
        gl_FragColor = vec4(uColor, alpha);
      }
    `
  });

  if (points) scene.remove(points);
  points = new THREE.Points(geometry, material);
  scene.add(points);
}

function isInsideBrain(x, y) {
  // Map world x,y -> SVG local
  const lx = (x - brainTransform.offsetX) / brainTransform.scale;
  const ly = (y - brainTransform.offsetY) / brainTransform.scale;
  // Use even-odd fill rule to respect complex overlaps
  offscreen.save();
  const inside = offscreen.isPointInPath(path2D, lx, ly, 'evenodd');
  offscreen.restore();
  return inside;
}

function onResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.left = 0; camera.right = window.innerWidth; camera.top = 0; camera.bottom = window.innerHeight;
  camera.updateProjectionMatrix();
  buildPoints();
}

function animate() {
  requestAnimationFrame(animate);

  // Subtle drift (update positions before hover sizing)
  const now = performance.now() * 0.001;
  let moved = false;
  const DRIFT_EASE = 0.065; // slightly gentler easing
  const MAX_STEP = 1.6;     // moderate per-frame cap
  // global "breathing" factor that modulates amplitudes slowly
  const breath = 1.0 + 0.50 * (0.5 * (1.0 + Math.sin(now * (2.0 * Math.PI / 5.5)))); // deeper, ~5.5s
  for (let i = 0; i < NUM_DOTS; i++) {
    const i3 = i * 3;
    const bx = basePositions[i3 + 0];
    const by = basePositions[i3 + 1];
    const dirx = driftDirs[i*2 + 0];
    const diry = driftDirs[i*2 + 1];
    const amp = driftAmps[i] * breath;
    const spd = driftSpeeds[i];
    const ph = phases[i];
    let ox = dirx * Math.sin(now * spd + ph) * amp;
    let oy = diry * Math.cos(now * spd + ph) * amp;
    let nx = bx + ox;
    let ny = by + oy;
    if (!isInsideBrain(nx, ny)) { ox *= 0.5; oy *= 0.5; nx = bx + ox; ny = by + oy; if (!isInsideBrain(nx, ny)) { nx = bx; ny = by; } }
    const cx = positions[i3 + 0];
    const cy = positions[i3 + 1];
    let sx = cx + (nx - cx) * DRIFT_EASE;
    let sy = cy + (ny - cy) * DRIFT_EASE;
    // velocity cap for extra smoothness
    const vx = sx - cx; const vy = sy - cy; const vlen = Math.hypot(vx, vy);
    if (vlen > MAX_STEP) { const s = MAX_STEP / vlen; sx = cx + vx * s; sy = cy + vy * s; }
    if (cx !== sx || cy !== sy) moved = true;
    positions[i3 + 0] = sx; positions[i3 + 1] = sy;
  }
  if (moved) geometry.attributes.position.needsUpdate = true;

  // Background gradient that reflects hover position within the brain
  updateBackgroundGradient(now);

  // Smooth monotonic distance falloff (Gaussian), absolute boost so nearer always larger
  const minDim = Math.min(window.innerWidth, window.innerHeight);
  const sigma = Math.max(8, minDim * 0.03);   // spread of influence
  const maxBoost = 18; // px added at the pointer center

  if (!pointer.inside) {
    for (let i = 0; i < NUM_DOTS; i++) targetSizes[i] = baseSizes[i];
  } else {
    const inv2Sigma2 = 1.0 / (2.0 * sigma * sigma);
    for (let i = 0; i < NUM_DOTS; i++) {
      const ix = positions[i*3+0];
      const iy = positions[i*3+1];
      const dx = ix - pointer.x;
      const dy = iy - pointer.y;
      const dist2 = dx*dx + dy*dy;
      const w = Math.exp(-dist2 * inv2Sigma2); // 1 at center, -> 0 smoothly
      targetSizes[i] = baseSizes[i] + maxBoost * w;
    }
  }

  // no overlap clamping; allow natural overlap during hover

  // Ease sizes
  let anyChange = false;
  for (let i = 0; i < NUM_DOTS; i++) {
    const s = sizes[i];
    const ts = targetSizes[i];
    const ns = s + (ts - s) * EASE;
    if (Math.abs(ns - s) > 0.001) anyChange = true;
    sizes[i] = ns;
  }
  if (anyChange) geometry.attributes.aSize.needsUpdate = true;

  renderer.render(scene, camera);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function clamp01(v) { return Math.max(0, Math.min(1, v)); }

function updateBackgroundGradient(now) {
  if (!bgEl) return;
  const ease = 0.18; // background follow speed
  // Map pointer to normalized coords within brain bbox in screen space
  let tx = gradState.x, ty = gradState.y, tt = gradState.t;
  if (pointer.inside) {
    const bx0 = brainTransform.offsetX;
    const by0 = brainTransform.offsetY;
    const bw = (brainBBox.max.x - brainBBox.min.x) * brainTransform.scale;
    const bh = (brainBBox.max.y - brainBBox.min.y) * brainTransform.scale;
    const nx = clamp01((pointer.x - bx0) / Math.max(1, bw));
    const ny = clamp01((pointer.y - by0) / Math.max(1, bh));
    tx += (nx - tx) * ease;
    ty += (ny - ty) * ease;
    tt += (1 - tt) * ease; // fade in
  } else {
    tt += (0 - tt) * ease; // fade out to white
  }
  gradState.x = tx; gradState.y = ty; gradState.t = tt;

  // Compute two red shades based on position
  // Hue fixed at red, vary lightness/saturation smoothly by x/y
  const sat = Math.max(50, Math.min(90, 70 + 20 * (2 * tx - 1))); // 50..90
  const light1 = 92 - 30 * ty;        // ~62..92
  const light2 = 82 - 40 * (1 - ty);  // ~42..82
  const c1 = `hsl(0 ${Math.round(sat)}% ${Math.round(light1)}%)`;
  const c2 = `hsl(0 ${Math.round(sat)}% ${Math.round(light2)}%)`;

  // Blend with white depending on tt
  if (tt > 0.001) {
    const cx = Math.round(tx * 100);
    const cy = Math.round(ty * 100);
    bgEl.style.background = `radial-gradient(120vmax circle at ${cx}% ${cy}%, ${c1}, ${c2})`;
    bgEl.style.opacity = String(Math.max(0, Math.min(1, 0.85 * tt)));
  } else {
    bgEl.style.background = '#ffffff';
    bgEl.style.opacity = '1';
  }
}



