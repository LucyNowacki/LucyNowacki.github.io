// Geometry-only Three.js backend. Mathematical models and certificate values
// remain in their existing modules; labels are composited by each view.
import * as THREE from './vendor/three/three.module.js';
import {LineSegments2} from './vendor/three/lines/LineSegments2.js';
import {LineSegmentsGeometry} from './vendor/three/lines/LineSegmentsGeometry.js';
import {LineMaterial} from './vendor/three/lines/LineMaterial.js';

let shared = null, failure = '', lost = false, draws = 0;
const meshPool = [], linePool = [];
const scene = new THREE.Scene(), group = new THREE.Group();
const camera = new THREE.OrthographicCamera();
scene.add(group);
const rotationMatrix = new THREE.Matrix4(), vector = new THREE.Vector3();

function renderer() {
  if (failure || lost) return null;
  if (shared) return shared;
  try {
    // One offscreen context for all panels. Each frame is copied immediately
    // into the existing canvas, before its independent text overlay is drawn.
    // This also keeps the last frame visible while a panel is offscreen.
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2', {alpha: true, antialias: true});
    if (!context) { failure = 'WebGL 2 is unavailable'; return null; }
    shared = new THREE.WebGLRenderer({canvas, context, alpha: true, antialias: true});
    shared.outputColorSpace = THREE.SRGBColorSpace;
    shared.setClearColor(0x000000, 0);
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault(); lost = true;
    });
    canvas.addEventListener('webglcontextrestored', () => { lost = false; });
    return shared;
  } catch (error) {
    failure = String(error.message || error);
    return null;
  }
}

function rgba(value, opacity = 1) {
  const text = value || '#4b0082';
  if (/^#[\da-f]{8}$/i.test(text)) {
    return [text.slice(0, 7), opacity * parseInt(text.slice(7), 16) / 255];
  }
  // Callers pass CSS hex colors. Retain CSS rgb/rgba support for old meshes.
  const match = /^rgba\(([^)]+)\)$/.exec(text);
  if (match) {
    const parts = match[1].split(',').map(Number);
    return [`rgb(${parts.slice(0, 3).join(',')})`, opacity * parts[3]];
  }
  return [text, opacity];
}

function attribute(geometry, name, values, itemSize, instanced = false) {
  let old = geometry.getAttribute(name);
  if (!old || old.array.length !== values.length) {
    old = instanced
      ? new THREE.InstancedBufferAttribute(new Float32Array(values), itemSize)
      : new THREE.Float32BufferAttribute(values, itemSize);
    old.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute(name, old);
  } else { old.array.set(values); old.needsUpdate = true; }
}

function meshAt(index, positions, color, opacity, screenSpace = false, occludes = false) {
  let mesh = meshPool[index];
  if (!mesh) {
    mesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide, transparent: true, depthWrite: false,
    }));
    mesh.frustumCulled = false;
    meshPool.push(mesh);
  }
  const oldPosition = mesh.geometry.getAttribute('position');
  if (oldPosition && oldPosition.array.length !== positions.length) {
    mesh.geometry.dispose(); mesh.geometry = new THREE.BufferGeometry();
  }
  attribute(mesh.geometry, 'position', positions, 3);
  mesh.geometry.setDrawRange(0, positions.length / 3);
  mesh.material.color.set(color);
  mesh.material.opacity = opacity;
  mesh.material.depthTest = !screenSpace;
  mesh.material.depthWrite = occludes;
  // Keep the boundary grid visible above its own tessellated protected fill.
  mesh.material.polygonOffset = occludes;
  mesh.material.polygonOffsetFactor = 1;
  mesh.material.polygonOffsetUnits = 1;
  mesh.material.side = occludes ? THREE.FrontSide : THREE.DoubleSide;
  mesh.renderOrder = screenSpace ? 10 : 0;
  mesh.visible = true;
  return mesh;
}

function lineAt(index, batch, width, height) {
  let line = linePool[index];
  if (!line) {
    line = new LineSegments2(new LineSegmentsGeometry(), new LineMaterial({
      worldUnits: false, transparent: true, depthWrite: false,
    }));
    line.frustumCulled = false;
    linePool.push(line);
  }
  const current = line.geometry.getAttribute('instanceStart');
  if (!current || current.data.array.length !== batch.positions.length) {
    if (current) { line.geometry.dispose(); line.geometry = new LineSegmentsGeometry(); }
    line.geometry.setPositions(new Float32Array(batch.positions));
    line.geometry.getAttribute('instanceStart').data.setUsage(THREE.DynamicDrawUsage);
  } else {
    current.data.array.set(batch.positions); current.data.needsUpdate = true;
  }
  attribute(line.geometry, 'instanceDistanceStart', batch.starts, 1, true);
  attribute(line.geometry, 'instanceDistanceEnd', batch.ends, 1, true);
  line.geometry.instanceCount = batch.starts.length;
  const material = line.material;
  material.color.set(batch.color);
  material.opacity = batch.opacity;
  material.linewidth = batch.width;
  material.dashed = !!batch.dash;
  material.dashSize = batch.dash?.[0] ?? 6;
  material.gapSize = batch.dash?.[1] ?? 4;
  material.dashScale = 1;
  material.resolution.set(width, height);
  // onBeforeRender normally derives this from the shared viewport. Here it
  // is explicitly CSS-sized; DPR belongs to the drawing buffer only.
  line.onBeforeRender = () => material.resolution.set(width, height);
  // Coordinate axes are reference guides: keep them visible through protected fill.
  material.depthTest = !batch.axis;
  line.renderOrder = batch.axis ? 5 : 1;
  line.visible = true;
  return line;
}

/** Render world-coordinate primitives using the caller's exact orthographic
 * projection. Surface fn accepts a unit direction; faces are convex polygons.
 * yaw/pitch use Rx(pitch) Ry(yaw). Optional rotation=[x,y,z] uses XYZ Euler.
 * widths, dashes and marker radii are CSS pixels, independent of zoom and DPR.
 * Returns false without changing the canvas when WebGL is unavailable.
 */
export function renderThreeGeometry(canvas, options) {
  const gl = renderer();
  if (!gl) {
    canvas.dataset.renderer = 'canvas-fallback';
    canvas.dataset.rendererReason = failure || 'WebGL context is restoring';
    return false;
  }
  const {width: W, height: H, centre = [W / 2, H / 2], range = 1,
    yaw = 0, pitch = 0, zoom = 1, palette = {}, surfaces = [],
    paths = [], faces = [], points = []} = options;
  if (!(W > 0 && H > 0)) return false;
  const scale = (options.fitScale ?? Math.min(W * .42, H * .39) / range) * zoom;
  if (!(scale > 0 && Number.isFinite(scale))) return false;
  const angles = options.rotation || [pitch, yaw, 0];
  group.rotation.set(...angles, 'XYZ');
  rotationMatrix.makeRotationFromEuler(group.rotation);
  const rotate = point => vector.fromArray(point).applyMatrix4(rotationMatrix).toArray();
  const fillBatches = new Map(), lineBatches = new Map();
  let extent = 1;
  const measure = point => { extent = Math.max(extent, Math.hypot(...point)); };
  const polygon = (pts, color, opacity, occludes = false) => {
    if (!opacity || pts.length < 3) return;
    const [rgb, alpha] = rgba(color, opacity), key = `${rgb}|${alpha}|${occludes}`;
    let batch = fillBatches.get(key);
    if (!batch) fillBatches.set(key, batch = {color: rgb, opacity: alpha, occludes, positions: []});
    pts.forEach(measure);
    for (let i = 1; i < pts.length - 1; i++) batch.positions.push(...pts[0], ...pts[i], ...pts[i + 1]);
  };
  const path = ({pts, color, width = 1.5, dash = false, opacity = 1, axis = false}) => {
    if (pts.length < 2) return;
    const [rgb, alpha] = rgba(color, opacity);
    const pattern = Array.isArray(dash) && dash.length ? dash : dash && !Array.isArray(dash) ? [6, 4] : false;
    const key = JSON.stringify([rgb, alpha, width, pattern, axis]);
    let batch = lineBatches.get(key);
    if (!batch) lineBatches.set(key, batch = {color: rgb, opacity: alpha, width,
      dash: pattern, axis, positions: [], starts: [], ends: []});
    let distance = 0, previous = rotate(pts[0]);
    measure(pts[0]);
    for (let i = 1; i < pts.length; i++) {
      measure(pts[i]);
      const next = rotate(pts[i]);
      const length = Math.hypot(next[0] - previous[0], next[1] - previous[1]) * scale;
      if (length > 1e-7) {
        batch.positions.push(...pts[i - 1], ...pts[i]);
        batch.starts.push(distance); batch.ends.push(distance + length);
      }
      distance += length; previous = next;
    }
  };
  for (const surface of surfaces) {
    const rows = 16, columns = 48;
    const grid = Array.from({length: rows + 1}, (_, i) => Array.from({length: columns + 1}, (_, j) => {
      const lat = -Math.PI / 2 + i * Math.PI / rows, lon = j * 2 * Math.PI / columns;
      return surface.fn([Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)]);
    }));
    for (let i = 0; i < rows; i++) for (let j = 0; j < columns; j++) {
      polygon([grid[i][j], grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]],
        surface.fillColor || surface.color, surface.opacity || 0, surface.occludes ?? !!surface.fillColor);
    }
    for (let i = 2; i < rows; i += 2) path({pts: grid[i], color: surface.color,
      width: surface.dash ? 2 : 1.25, dash: surface.dash, opacity: .65});
    for (let j = 0; j < columns; j += 6) path({pts: grid.map(row => row[j]), color: surface.color,
      width: surface.dash ? 2 : 1.25, dash: surface.dash, opacity: .45});
  }
  faces.forEach(face => polygon(face.pts, face.color, face.opacity ?? 1));
  paths.forEach(path);
  points.forEach(point => measure(point.p));

  group.clear();
  for (const item of [...meshPool, ...linePool]) item.visible = false;
  let meshIndex = 0, lineIndex = 0;
  for (const batch of fillBatches.values()) group.add(meshAt(meshIndex++, batch.positions, batch.color, batch.opacity, false, batch.occludes));
  for (const batch of lineBatches.values()) if (batch.starts.length) group.add(lineAt(lineIndex++, batch, W, H));

  // Billboards retain a constant CSS radius. Markers identify selected points;
  // they intentionally remain visible through transparent wireframes.
  const inverse = rotationMatrix.clone().invert();
  for (const point of points) {
    const centre3 = rotate(point.p), radius = point.radius ?? 4;
    for (const [r, color] of [[radius + 1, '#ffffff'], [radius, point.color]]) {
      const count = point.shape === 'diamond' ? 4 : 20, vertices = [];
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2, b = ((i + 1) / count) * Math.PI * 2;
        for (const p of [centre3, [centre3[0] + r / scale * Math.sin(a), centre3[1] + r / scale * Math.cos(a), centre3[2]],
          [centre3[0] + r / scale * Math.sin(b), centre3[1] + r / scale * Math.cos(b), centre3[2]]]) {
          vertices.push(...vector.fromArray(p).applyMatrix4(inverse).toArray());
        }
      }
      group.add(meshAt(meshIndex++, vertices, color || '#ff0000', 1, true));
    }
  }

  camera.left = -centre[0] / scale;
  camera.right = (W - centre[0]) / scale;
  camera.top = centre[1] / scale;
  camera.bottom = (centre[1] - H) / scale;
  camera.position.set(0, 0, extent * 4);
  camera.near = .001; camera.far = extent * 8;
  camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (gl.getPixelRatio() !== dpr) gl.setPixelRatio(dpr);
  const size = gl.getSize(new THREE.Vector2());
  if (size.x !== W || size.y !== H) gl.setSize(W, H, false);
  gl.setClearColor(palette.background || '#ffffff', palette.background ? 1 : 0);
  gl.render(scene, camera);
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(gl.domElement, 0, 0, canvas.width, canvas.height);
  ctx.restore();
  canvas.dataset.renderer = 'threejs';
  delete canvas.dataset.rendererReason;
  draws++;
  return true;
}

export function getThreeRendererStats() {
  return {revision: THREE.REVISION, backend: shared && !lost ? 'threejs' : 'canvas-fallback',
    contexts: shared ? 1 : 0, draws, meshes: meshPool.length, lineBatches: linePool.length,
    geometries: shared?.info.memory.geometries || 0, reason: failure || (lost ? 'Context lost' : '')};
}

export function disposeThreeRenderer() {
  group.clear();
  for (const item of [...meshPool, ...linePool]) { item.geometry.dispose(); item.material.dispose(); }
  meshPool.length = linePool.length = 0;
  shared?.dispose(); shared?.forceContextLoss(); shared = null; lost = false; failure = '';
}
window.addEventListener('pagehide', disposeThreeRenderer);
