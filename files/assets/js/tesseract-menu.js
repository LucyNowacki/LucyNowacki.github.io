import * as THREE from "../vendor/three/three.module.min.js";

const MENU_ITEMS = [
  {
    title: "AI Solutions",
    href: "./categories/machine-learning",
    axis: "x",
    sign: 1,
    plane: "xw",
    color: 0x53bae2,
    labelFaceAxis: "z",
    labelFaceSign: 1,
    labelSize: [1.58, 0.54],
    labelOffset: [1.05, -0.1],
  },
  {
    title: "Numerical",
    href: "./categories/numerical",
    axis: "x",
    sign: -1,
    plane: "xw",
    color: 0xf004f8,
    labelFaceAxis: "y",
    labelFaceSign: -1,
    labelSize: [1.38, 0.48],
    labelOffset: [-1.1, 0.06],
  },
  {
    title: "Transhuman",
    href: "./categories/transhumanism",
    axis: "y",
    sign: 1,
    plane: "yw",
    color: 0xff2c8f,
    labelFaceAxis: "z",
    labelFaceSign: 1,
    labelSize: [1.58, 0.54],
    labelOffset: [0, -1.12],
  },
  {
    title: "FinTech",
    href: "./categories/fintech",
    axis: "y",
    sign: -1,
    plane: "yw",
    color: 0x53bae2,
    labelFaceAxis: "w",
    labelFaceSign: -1,
    labelSize: [1.58, 0.54],
    labelOffset: [0, 1.1],
  },
  {
    title: "NLP & LLM",
    href: "./categories/nlp",
    axis: "z",
    sign: 1,
    plane: "zw",
    color: 0xf004f8,
    labelFaceAxis: "x",
    labelFaceSign: -1,
    labelSize: [1.58, 0.54],
    labelOffset: [0.95, -0.7],
  },
  {
    title: "Tags",
    href: "./categories/",
    axis: "z",
    sign: -1,
    plane: "zw",
    color: 0x7ee7ff,
    labelFaceAxis: "w",
    labelFaceSign: 1,
    labelSize: [1.22, 0.46],
    labelOffset: [-0.95, 0.72],
  },
  {
    title: "Contact",
    href: "./bio/index.html",
    axis: "w",
    sign: 1,
    plane: "xy",
    color: 0xff2c8f,
    labelFaceAxis: "y",
    labelFaceSign: 1,
    labelSize: [1.58, 0.54],
    labelOffset: [-0.72, -0.58],
  },
  {
    title: "Proofs",
    href: "./categories/proofs",
    axis: "w",
    sign: -1,
    plane: "xz",
    color: 0x53bae2,
    labelFaceAxis: "x",
    labelFaceSign: 1,
    labelSize: [1.58, 0.54],
    labelOffset: [0.82, 0.62],
  },
];

const AXES = ["x", "y", "z", "w"];
const PLANE_PAIRS = {
  xy: ["x", "y"],
  xz: ["x", "z"],
  xw: ["x", "w"],
  yz: ["y", "z"],
  yw: ["y", "w"],
  zw: ["z", "w"],
};

const CELL_FACE_VERTICES = createCellFaceVertices();

document.querySelectorAll("[data-tesseract-menu]").forEach((root) => {
  initTesseractMenu(root);
});

function initTesseractMenu(root) {
  const stage = root.querySelector("[data-tesseract-stage]");
  const labelLayer = root.querySelector("[data-tesseract-labels]");

  if (!stage || !labelLayer) {
    return;
  }

  if (!canCreateWebGLContext()) {
    root.classList.add("is-webgl-unavailable");
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 7.25);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  stage.appendChild(renderer.domElement);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const group = new THREE.Group();
  scene.add(group);

  const baseVertices = createVertices4D();
  const edgePairs = createEdges(baseVertices);
  const projectedVertices = baseVertices.map(() => new THREE.Vector3());

  const lineGeometry = new THREE.BufferGeometry();
  const linePositions = new Float32Array(edgePairs.length * 2 * 3);
  lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));

  const edgeCore = new THREE.LineSegments(
    lineGeometry,
    new THREE.LineBasicMaterial({
      color: 0x7ee7ff,
      transparent: true,
      opacity: 0.9,
    }),
  );
  const edgeGlow = new THREE.LineSegments(
    lineGeometry,
    new THREE.LineBasicMaterial({
      color: 0xf004f8,
      transparent: true,
      opacity: 0.38,
    }),
  );
  edgeGlow.scale.setScalar(1.012);
  group.add(edgeGlow, edgeCore);

  const cellMeshes = MENU_ITEMS.map((item, index) => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(CELL_FACE_VERTICES.length * 3);
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setIndex(CELL_FACE_VERTICES.map((_, i) => i));

    const material = new THREE.MeshBasicMaterial({
      color: item.color,
      transparent: true,
      opacity: 0.11,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.menuIndex = index;
    mesh.renderOrder = 2;
    group.add(mesh);
    return mesh;
  });

  const labelPatches = MENU_ITEMS.map(createLabelPatchCorners);
  const surfaceLabelMeshes = MENU_ITEMS.map((item, index) => {
    const texture = createLabelTexture(item);
    const front = createSurfaceLabelMesh(index, texture, THREE.FrontSide, false);
    const back = createSurfaceLabelMesh(index, texture, THREE.BackSide, true);
    group.add(front, back);
    return { front, back };
  });

  function createSurfaceLabelMesh(index, texture, side, mirrorX) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(12), 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(createLabelUvs(mirrorX), 2));
    geometry.setIndex([0, 2, 1, 1, 2, 3]);

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.78,
      side,
      depthWrite: false,
      depthTest: false,
      alphaTest: 0.02,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.menuIndex = index;
    mesh.renderOrder = 8;
    return mesh;
  }

  const particleField = createParticleField();
  scene.add(particleField);

  const labels = MENU_ITEMS.map((item, index) => {
    const link = document.createElement("a");
    link.className = "tesseract-label";
    link.href = item.href;
    link.textContent = item.title;
    link.dataset.menuIndex = String(index);
    link.addEventListener("mouseenter", () => setActiveCell(index));
    link.addEventListener("mouseleave", () => clearActiveCell(index));
    labelLayer.appendChild(link);
    return link;
  });

  const angles4D = {
    xy: 0.2,
    xz: -0.18,
    xw: 0.34,
    yz: 0,
    yw: -0.24,
    zw: 0.16,
  };

  const viewRotation = {
    x: -0.24,
    y: 0.38,
  };

  const state = {
    width: 1,
    height: 1,
    activeIndex: -1,
    dragging: false,
    pointerId: null,
    dragStartX: 0,
    dragStartY: 0,
    lastX: 0,
    lastY: 0,
    moved: false,
    longPressTimer: 0,
    longPressFired: false,
    rotationTween: null,
    lastTime: performance.now(),
  };

  root.classList.add("is-enhanced");

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  resize();

  stage.addEventListener("pointerdown", onPointerDown);
  stage.addEventListener("pointermove", onPointerMove);
  stage.addEventListener("pointerup", onPointerUp);
  stage.addEventListener("pointercancel", cancelPointer);
  stage.addEventListener("pointerleave", onPointerLeave);
  stage.addEventListener("contextmenu", onContextMenu);

  requestAnimationFrame(tick);

  function tick(now) {
    const dt = Math.min(64, now - state.lastTime) / 1000;
    state.lastTime = now;

    angles4D.xy += dt * 0.08;
    angles4D.zw -= dt * 0.055;
    updateRotationTween(now);
    updateGeometry();
    updateLabels();

    particleField.rotation.y += dt * 0.025;
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  function resize() {
    const rect = stage.getBoundingClientRect();
    state.width = Math.max(1, rect.width);
    state.height = Math.max(1, rect.height);
    camera.aspect = state.width / state.height;
    camera.updateProjectionMatrix();
    renderer.setSize(state.width, state.height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }

  function updateGeometry() {
    for (let i = 0; i < baseVertices.length; i += 1) {
      const rotated = rotate4D(baseVertices[i], angles4D);
      projectedVertices[i].copy(project4Dto3D(rotated));
    }

    for (let i = 0; i < edgePairs.length; i += 1) {
      const [a, b] = edgePairs[i];
      writeVector(linePositions, i * 6, projectedVertices[a]);
      writeVector(linePositions, i * 6 + 3, projectedVertices[b]);
    }
    lineGeometry.attributes.position.needsUpdate = true;
    lineGeometry.computeBoundingSphere();

    MENU_ITEMS.forEach((item, menuIndex) => {
      const mesh = cellMeshes[menuIndex];
      const positions = mesh.geometry.attributes.position.array;
      const faceVertices = getCellTriangles(item.axis, item.sign);
      for (let i = 0; i < faceVertices.length; i += 1) {
        writeVector(positions, i * 3, projectedVertices[faceVertices[i]]);
      }
      mesh.geometry.attributes.position.needsUpdate = true;
      mesh.geometry.computeVertexNormals();
      mesh.geometry.computeBoundingSphere();
      mesh.geometry.computeBoundingBox();
      mesh.material.opacity = menuIndex === state.activeIndex ? 0.24 : 0.11;
    });

    labelPatches.forEach((patchCorners, menuIndex) => {
      const projectedCorners = patchCorners.map((corner) => project4Dto3D(rotate4D(corner, angles4D)));
      [surfaceLabelMeshes[menuIndex].front, surfaceLabelMeshes[menuIndex].back].forEach((mesh) => {
        const positions = mesh.geometry.attributes.position.array;
        projectedCorners.forEach((projected, cornerIndex) => {
          writeVector(positions, cornerIndex * 3, projected);
        });
        mesh.geometry.attributes.position.needsUpdate = true;
        mesh.geometry.computeBoundingSphere();
      });
    });

    group.rotation.x = viewRotation.x;
    group.rotation.y = viewRotation.y;
  }

  function updateLabels() {
    group.updateMatrixWorld();

    MENU_ITEMS.forEach((item, index) => {
      const center = {
        x: item.axis === "x" ? item.sign : 0,
        y: item.axis === "y" ? item.sign : 0,
        z: item.axis === "z" ? item.sign : 0,
        w: item.axis === "w" ? item.sign : 0,
      };
      const projected = project4Dto3D(rotate4D(center, angles4D));
      const screen = projected.clone().applyMatrix4(group.matrixWorld).project(camera);

      const depth = THREE.MathUtils.clamp((screen.z + 1) / 2, 0, 1);
      const offsetScale = THREE.MathUtils.clamp(state.width * 0.07, 28, 68);
      const rawX = (screen.x * 0.5 + 0.5) * state.width + item.labelOffset[0] * offsetScale;
      const rawY = (-screen.y * 0.5 + 0.5) * state.height + item.labelOffset[1] * offsetScale;
      const x = THREE.MathUtils.clamp(rawX, 18, state.width - 18);
      const y = THREE.MathUtils.clamp(rawY, 18, state.height - 18);
      const scale = THREE.MathUtils.clamp(1.14 - depth * 0.28, 0.78, 1.08);
      const opacity = THREE.MathUtils.clamp(1 - depth * 0.48, 0.52, 1);
      const isActive = index === state.activeIndex;
      const surfaceArea = getPatchScreenArea(labelPatches[index], angles4D, group, camera, state);
      const surfaceOpacityMax = isActive ? 1 : 0.94;
      const surfaceOpacityMin = isActive ? 0.72 : 0.52;
      const surfaceOpacity = THREE.MathUtils.clamp(
        surfaceArea / Math.max(900, state.width * state.height * 0.012),
        surfaceOpacityMin,
        surfaceOpacityMax,
      );

      const label = labels[index];
      label.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      label.style.opacity = isActive ? String(opacity) : "0";
      label.style.pointerEvents = isActive ? "auto" : "none";
      label.style.zIndex = String(100 + Math.round((1 - depth) * 80));
      label.classList.toggle("is-active", isActive);
      surfaceLabelMeshes[index].front.material.opacity = surfaceOpacity;
      surfaceLabelMeshes[index].back.material.opacity = surfaceOpacity;
    });
  }

  function onPointerDown(event) {
    if (event.button !== 0) {
      return;
    }

    state.dragging = true;
    state.pointerId = event.pointerId;
    state.dragStartX = event.clientX;
    state.dragStartY = event.clientY;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    state.moved = false;
    state.longPressFired = false;
    stage.classList.add("is-dragging");
    stage.setPointerCapture(event.pointerId);

    if (event.pointerType === "touch") {
      window.clearTimeout(state.longPressTimer);
      state.longPressTimer = window.setTimeout(() => {
        state.longPressFired = true;
        const hitIndex = pickCell(event.clientX, event.clientY);
        if (hitIndex !== -1) {
          setActiveCell(hitIndex);
          startCellRotation(hitIndex);
        }
      }, 620);
    }
  }

  function onPointerMove(event) {
    if (state.dragging && event.pointerId === state.pointerId) {
      const dx = event.clientX - state.lastX;
      const dy = event.clientY - state.lastY;
      const totalDx = event.clientX - state.dragStartX;
      const totalDy = event.clientY - state.dragStartY;

      if (Math.hypot(totalDx, totalDy) > 5) {
        state.moved = true;
        window.clearTimeout(state.longPressTimer);
      }

      viewRotation.y += dx * 0.0065;
      viewRotation.x += dy * 0.0065;
      viewRotation.x = THREE.MathUtils.clamp(viewRotation.x, -1.25, 1.25);
      state.lastX = event.clientX;
      state.lastY = event.clientY;
      return;
    }

    const hitIndex = pickCell(event.clientX, event.clientY);
    setActiveCell(hitIndex);
  }

  function onPointerUp(event) {
    if (!state.dragging || event.pointerId !== state.pointerId) {
      return;
    }

    window.clearTimeout(state.longPressTimer);
    stage.classList.remove("is-dragging");
    stage.releasePointerCapture(event.pointerId);

    const hitIndex = pickCell(event.clientX, event.clientY);
    if (!state.moved && !state.longPressFired && event.pointerType !== "touch" && hitIndex !== -1) {
      window.location.href = MENU_ITEMS[hitIndex].href;
    } else if (!state.moved && hitIndex !== -1) {
      setActiveCell(hitIndex);
    }

    state.dragging = false;
    state.pointerId = null;
  }

  function cancelPointer(event) {
    if (state.pointerId !== event.pointerId) {
      return;
    }

    window.clearTimeout(state.longPressTimer);
    stage.classList.remove("is-dragging");
    state.dragging = false;
    state.pointerId = null;
  }

  function onPointerLeave() {
    if (!state.dragging) {
      setActiveCell(-1);
    }
  }

  function onContextMenu(event) {
    event.preventDefault();
    const hitIndex = pickCell(event.clientX, event.clientY);
    if (hitIndex !== -1) {
      setActiveCell(hitIndex);
      startCellRotation(hitIndex);
    }
  }

  function pickCell(clientX, clientY) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(cellMeshes, false);
    return hits.length ? hits[0].object.userData.menuIndex : -1;
  }

  function setActiveCell(index) {
    state.activeIndex = index;
  }

  function clearActiveCell(index) {
    if (state.activeIndex === index) {
      state.activeIndex = -1;
    }
  }

  function startCellRotation(index) {
    const item = MENU_ITEMS[index];
    const plane = item.plane;
    const direction = item.sign > 0 ? 1 : -1;
    state.rotationTween = {
      plane,
      startValue: angles4D[plane],
      endValue: angles4D[plane] + direction * Math.PI * 0.5,
      startTime: performance.now(),
      duration: 900,
    };
  }

  function updateRotationTween(now) {
    if (!state.rotationTween) {
      return;
    }

    const tween = state.rotationTween;
    const t = THREE.MathUtils.clamp((now - tween.startTime) / tween.duration, 0, 1);
    const eased = easeInOutCubic(t);
    angles4D[tween.plane] = tween.startValue + (tween.endValue - tween.startValue) * eased;

    if (t >= 1) {
      state.rotationTween = null;
    }
  }
}

function createVertices4D() {
  const vertices = [];
  [-1, 1].forEach((x) => {
    [-1, 1].forEach((y) => {
      [-1, 1].forEach((z) => {
        [-1, 1].forEach((w) => {
          vertices.push({ x, y, z, w });
        });
      });
    });
  });
  return vertices;
}

function createEdges(vertices) {
  const edges = [];
  for (let i = 0; i < vertices.length; i += 1) {
    for (let j = i + 1; j < vertices.length; j += 1) {
      const diff = AXES.reduce((count, axis) => count + (vertices[i][axis] !== vertices[j][axis] ? 1 : 0), 0);
      if (diff === 1) {
        edges.push([i, j]);
      }
    }
  }
  return edges;
}

function rotate4D(vertex, angles) {
  const point = { ...vertex };
  Object.keys(PLANE_PAIRS).forEach((plane) => {
    const angle = angles[plane] || 0;
    if (!angle) {
      return;
    }

    const [a, b] = PLANE_PAIRS[plane];
    const ca = Math.cos(angle);
    const sa = Math.sin(angle);
    const av = point[a];
    const bv = point[b];
    point[a] = av * ca - bv * sa;
    point[b] = av * sa + bv * ca;
  });
  return point;
}

function project4Dto3D(vertex) {
  const distance = 4.2;
  const scale = distance / (distance - vertex.w);
  return new THREE.Vector3(vertex.x * scale, vertex.y * scale, vertex.z * scale);
}

function writeVector(array, offset, vector) {
  array[offset] = vector.x;
  array[offset + 1] = vector.y;
  array[offset + 2] = vector.z;
}

function vertexIndexFromCoords(coords) {
  const xBit = coords.x > 0 ? 1 : 0;
  const yBit = coords.y > 0 ? 1 : 0;
  const zBit = coords.z > 0 ? 1 : 0;
  const wBit = coords.w > 0 ? 1 : 0;
  return xBit * 8 + yBit * 4 + zBit * 2 + wBit;
}

function createCellFaceVertices() {
  const vertices = [];
  for (let face = 0; face < 6; face += 1) {
    vertices.push(0, 1, 2, 2, 1, 3);
  }
  return vertices;
}

function createLabelUvs(mirrorX) {
  return mirrorX ? [
    1, 1,
    0, 1,
    1, 0,
    0, 0,
  ] : [
    0, 1,
    1, 1,
    0, 0,
    1, 0,
  ];
}

function getCellTriangles(axis, sign) {
  const freeAxes = AXES.filter((candidate) => candidate !== axis);
  const triangles = [];

  freeAxes.forEach((fixedAxis) => {
    [-1, 1].forEach((fixedSign) => {
      const varyingAxes = freeAxes.filter((candidate) => candidate !== fixedAxis);
      const corners = [
        { [axis]: sign, [fixedAxis]: fixedSign, [varyingAxes[0]]: -1, [varyingAxes[1]]: -1 },
        { [axis]: sign, [fixedAxis]: fixedSign, [varyingAxes[0]]: 1, [varyingAxes[1]]: -1 },
        { [axis]: sign, [fixedAxis]: fixedSign, [varyingAxes[0]]: -1, [varyingAxes[1]]: 1 },
        { [axis]: sign, [fixedAxis]: fixedSign, [varyingAxes[0]]: 1, [varyingAxes[1]]: 1 },
      ];
      triangles.push(
        vertexIndexFromCoords(corners[0]),
        vertexIndexFromCoords(corners[1]),
        vertexIndexFromCoords(corners[2]),
        vertexIndexFromCoords(corners[2]),
        vertexIndexFromCoords(corners[1]),
        vertexIndexFromCoords(corners[3]),
      );
    });
  });

  return triangles;
}

function createLabelPatchCorners(item) {
  const varyingAxes = AXES.filter((axis) => axis !== item.axis && axis !== item.labelFaceAxis);
  const halfWidth = item.labelSize[0] / 2;
  const halfHeight = item.labelSize[1] / 2;

  return [
    createLabelPatchCorner(item, varyingAxes, -halfWidth, halfHeight),
    createLabelPatchCorner(item, varyingAxes, halfWidth, halfHeight),
    createLabelPatchCorner(item, varyingAxes, -halfWidth, -halfHeight),
    createLabelPatchCorner(item, varyingAxes, halfWidth, -halfHeight),
  ];
}

function createLabelPatchCorner(item, varyingAxes, u, v) {
  const corner = { x: 0, y: 0, z: 0, w: 0 };
  corner[item.axis] = item.sign;
  corner[item.labelFaceAxis] = item.labelFaceSign;
  corner[varyingAxes[0]] = u;
  corner[varyingAxes[1]] = v;
  return corner;
}

function createLabelTexture(item) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 192;

  const ctx = canvas.getContext("2d");
  const accent = colorToRgba(item.color, 0.95);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(18, 7, 34, 0.78)";
  drawRoundedRect(ctx, 22, 24, 468, 144, 34);
  ctx.fill();

  ctx.lineWidth = 6;
  ctx.strokeStyle = accent;
  ctx.shadowColor = colorToRgba(item.color, 0.5);
  ctx.shadowBlur = 20;
  drawRoundedRect(ctx, 22, 24, 468, 144, 34);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
  drawRoundedRect(ctx, 38, 40, 436, 112, 24);
  ctx.stroke();

  ctx.fillStyle = "rgba(238, 252, 255, 0.98)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = colorToRgba(item.color, 0.85);
  ctx.shadowBlur = 14;
  ctx.font = fitLabelFont(ctx, item.title);
  ctx.lineWidth = 8;
  ctx.strokeStyle = "rgba(3, 4, 16, 0.88)";
  ctx.strokeText(item.title, canvas.width / 2, canvas.height / 2 + 2);
  ctx.fillText(item.title, canvas.width / 2, canvas.height / 2 + 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

function fitLabelFont(ctx, text) {
  let size = 58;
  do {
    ctx.font = `800 ${size}px Arial, Helvetica, sans-serif`;
    size -= 2;
  } while (ctx.measureText(text).width > 410 && size > 34);
  return ctx.font;
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function colorToRgba(color, alpha) {
  const parsed = new THREE.Color(color);
  const r = Math.round(parsed.r * 255);
  const g = Math.round(parsed.g * 255);
  const b = Math.round(parsed.b * 255);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getPatchScreenArea(patchCorners, angles4D, group, camera, state) {
  const points = patchCorners.map((corner) => {
    const projected = project4Dto3D(rotate4D(corner, angles4D));
    const screen = projected.applyMatrix4(group.matrixWorld).project(camera);
    return {
      x: (screen.x * 0.5 + 0.5) * state.width,
      y: (-screen.y * 0.5 + 0.5) * state.height,
    };
  });

  return Math.abs(
    points.reduce((area, point, index) => {
      const next = points[(index + 1) % points.length];
      return area + point.x * next.y - next.x * point.y;
    }, 0) / 2,
  );
}

function createParticleField() {
  const geometry = new THREE.BufferGeometry();
  const count = 90;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const a = seededNoise(i + 1);
    const b = seededNoise(i + 41);
    const c = seededNoise(i + 79);
    positions[i * 3] = (a - 0.5) * 8.2;
    positions[i * 3 + 1] = (b - 0.5) * 4.6;
    positions[i * 3 + 2] = -2.2 - c * 2.6;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: 0x7ee7ff,
      size: 0.026,
      transparent: true,
      opacity: 0.46,
      depthWrite: false,
    }),
  );
}

function seededNoise(value) {
  const raw = Math.sin(value * 12.9898) * 43758.5453;
  return raw - Math.floor(raw);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function canCreateWebGLContext() {
  const canvas = document.createElement("canvas");
  try {
    return !!(
      canvas.getContext("webgl2")
      || canvas.getContext("webgl")
      || canvas.getContext("experimental-webgl")
    );
  } catch (_) {
    return false;
  }
}
