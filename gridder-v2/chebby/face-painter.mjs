// Presentation-only deformation of the existing registered Chebby atlas.
// No image assets, audio or captions are written or sent anywhere.
export function composeFacePixels(frames, pose) {
  const width = 192, height = 208;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, Number.isFinite(x) ? x : a));
  const rest = frames[0];
  const pixels = new Uint8ClampedArray(rest);
  const viseme = Math.round(clamp(pose.viseme, 0, 9));
  const previous = Math.round(clamp(pose.previousViseme, 0, 9));
  const blend = clamp(pose.blend, 0, 1);
  // Continuous shape weights retain the currently visible mixture when speech
  // changes target mid-blend. Validate all ten entries, including sparse holes;
  // a malformed supplied mixture closes the mouth instead of selecting a pose.
  let weightedFrames = null, validWeights = pose.mouthWeights === undefined;
  if (Array.isArray(pose.mouthWeights) && pose.mouthWeights.length === 10) {
    let sum = 0, valid = true;
    for (let i = 0; i < 10; i++) {
      const value = pose.mouthWeights[i];
      if (!Number.isFinite(value) || value < 0 || value > 1) { valid = false; break; }
      sum += value;
    }
    if (valid && Math.abs(sum - 1) <= 1e-6) {
      validWeights = true;
      weightedFrames = [];
      for (let i = 0; i < 10; i++) if (pose.mouthWeights[i] > 0) {
        weightedFrames.push([i, pose.mouthWeights[i] / sum]);
      }
    }
  }
  // Only the controller can authorize the bounded release after fresh silence.
  // Hard stops retain immediate rest even if a previous shape is still supplied.
  const aperture = validWeights && (pose.voiced === true || pose.releasing === true)
    ? clamp(pose.aperture, 0, 1) : 0;
  // The source crops share a box but their actual openings are not registered:
  // W/SH, O and R lie at x=90.72, 85.66 and 91.19. Align the openings along
  // Chebby's existing sloped smile before balancing their two sides. Frame zero
  // stays untouched, including its original texture and closed-smile character.
  const centers = [87, 88.42, 86.34, 87.62, 83.67, 90.72, 85.66, 91.19, 88.26, 86.41];
  // Round openings tolerate exact bilateral averaging. Preserve more of the
  // original tongue/teeth detail in wider poses instead of washing it out.
  const reflection = [0, 0.3, 0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.3, 0.3];
  const cx = 87, cy = 105.5, cosine = 1 / Math.sqrt(1 + 0.18 ** 2), sine = -0.18 * cosine;
  const smooth = (value) => { const t = clamp(value, 0, 1); return t * t * (3 - 2 * t); };
  const sampleMouth = (frame, x, y, k) => {
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    const i = (iy * width + ix) * 4 + k;
    return frame[i] * (1 - fx) * (1 - fy) + frame[i + 4] * fx * (1 - fy)
      + frame[i + width * 4] * (1 - fx) * fy + frame[i + width * 4 + 4] * fx * fy;
  };
  // The historical atlas is bit-identical outside this muzzle rectangle.
  // Include its last row: A/AH contains forty changed pixels at y=122.
  // Blend one corrected RGB raster, without overlaying mouth sprites.
  for (let y = 95; y <= 122; y++) for (let x = 67; x <= 129; x++) {
    const i = (y * width + x) * 4;
    const u = (x - cx) * cosine + (y - cy) * sine;
    const v = -(x - cx) * sine + (y - cy) * cosine;
    // This feather is symmetric in local left/right position, and its upper
    // edge stays below both nostrils. No face, eye or silhouette is mirrored.
    const mask = smooth((20 - Math.abs(u)) / 5) * smooth((v + 6.5) / 2) * smooth((8 - v) / 3);
    const mirroredX = cx - u * cosine - v * sine;
    const mirroredY = cy - u * sine + v * cosine;
    // A's source art fades the left nostril. Retain its resting colour only
    // within this feathered ellipse; the accepted lip and right nostril stay
    // unchanged. Apply to A before mixing so interrupted blends remain linear.
    const noseRadius = Math.hypot((x - 79.5) / 3, (y - 100.2) / 2.5);
    const noseMask = smooth((1 - noseRadius) / 0.5);
    for (let k = 0; k < 3; k++) {
      const mouthColor = (index) => {
        const frame = frames[index] || rest;
        if (index === 0 || mask === 0 || frame === rest) return frame[i + k];
        if (index === 2 || index === 3) {
          // Dental art has different teeth/tongue heights and unmatched lip
          // outlines. One source half supplies one bilateral outer contour;
          // only the registered interior changes between teeth and tongue.
          // Sampling abs(u), rather than averaging two sides, keeps one edge.
          const sourceU = Math.abs(u) * 0.6;
          const sourceX = 92 + sourceU;
          // Lift both corners equally; the anatomical smile is curved even
          // after its native head tilt has been factored out.
          const mouthV = v + 0.018 * u * u;
          const sourceY = 105 - 0.35 * sourceU + mouthV;
          const dental = sampleMouth(frames[2] || rest, sourceX, sourceY, k);
          // Keep teeth at the sides and let a centered tongue become visible
          // through the slit and slightly below it, without a second lip line.
          const interiorRadius = (u / 7.5) ** 2 + ((mouthV - 0.8) / 2) ** 2;
          const interior = smooth((1 - interiorRadius) / 0.35);
          const tongue = index === 3
            ? sampleMouth(frame, sourceX, 104.3 - 0.35 * sourceU + mouthV * 0.7, k) : dental;
          const coherent = dental * (1 - interior) + tongue * interior;
          return frame[i + k] * (1 - mask) + coherent * mask;
        }
        const dx = centers[index] - cx, dy = -0.18 * dx;
        const centered = sampleMouth(frame, x + dx, y + dy, k);
        const reflected = sampleMouth(frame, mirroredX + dx, mirroredY + dy, k);
        const balanced = centered * (1 - reflection[index]) + reflected * reflection[index];
        return frame[i + k] * (1 - mask) + balanced * mask;
      };
      const corrected = (index) => {
        const value = mouthColor(index);
        return index === 8 && noseMask > 0
          ? value * (1 - noseMask) + rest[i + k] * noseMask : value;
      };
      let shape;
      if (weightedFrames) {
        shape = 0;
        for (const [index, weight] of weightedFrames) shape += corrected(index) * weight;
      } else shape = corrected(previous) * (1 - blend) + corrected(viseme) * blend;
      pixels[i + k] = rest[i + k] * (1 - aperture) + shape * aperture;
    }
  }
  const surprised = pose.captureEmotion === 'draining';
  const blink = clamp(pose.blink, 0, 1);
  const emphasis = clamp(pose.emphasis, 0, 1);
  // Less than half a degree, with a soft boundary wholly inside the face.
  const tilt = clamp(pose.tilt, -1, 1) * 0.006;
  if (!surprised && blink < 0.001 && emphasis < 0.001 && Math.abs(tilt) < 0.00001) return pixels;
  const before = pixels.slice();
  const sample = (x, y, k) => {
    x = clamp(x, 0, width - 1.001); y = clamp(y, 0, height - 1.001);
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    const i = (iy * width + ix) * 4 + k;
    return before[i] * (1 - fx) * (1 - fy) + before[i + 4] * fx * (1 - fy)
      + before[i + width * 4] * (1 - fx) * fy + before[i + width * 4 + 4] * fx * fy;
  };
  for (let y = 62; y < 130; y++) for (let x = 43; x < 131; x++) {
    const u = (x - 87) / 44, v = (y - 96) / 34;
    const weight = Math.max(0, 1 - u * u - v * v) ** 2;
    let sx = x + (y - 96) * tilt * weight;
    let sy = y - (x - 87) * tilt * weight - emphasis * 0.28 * weight;
    for (const [cx, cy, rx, ry] of [[62, 96, 12.5, 14], [107, 87, 12, 14]]) {
      const horizontal = (sx - cx) / rx;
      if (Math.abs(horizontal) >= 1) continue;
      const span = ry * Math.sqrt(1 - horizontal * horizontal);
      const dy = sy - cy;
      if (Math.abs(dy) >= span) continue;
      // Compress the pupil while stretching surrounding eyelid pixels.
      // The map is continuous at the core and is the identity at the border.
      const core = span * 0.69;
      const scale = surprised ? 1.18 : clamp(1 - 0.96 * blink + 0.035 * emphasis, 0.04, 1.035);
      // Capture alone widens the original iris/eyelid pixels; no replacement eyes.
      if (surprised) {
        const radial = Math.max(0, 1 - horizontal * horizontal - (dy / ry) ** 2);
        sx = cx + (sx - cx) / (1 + 0.12 * radial * radial);
      }
      const targetCore = core * scale;
      const distance = Math.abs(dy);
      const mapped = distance < targetCore ? distance / scale
        : core + (distance - targetCore) * (span - core) / (span - targetCore);
      sy = cy + Math.sign(dy) * mapped;
    }
    const i = (y * width + x) * 4;
    // Preserve the original alpha silhouette, including antialiased face edges.
    for (let k = 0; k < 3; k++) pixels[i + k] = sample(sx, sy, k);
  }
  return pixels;
}

export function loadFacePainter(canvas, url, compose = composeFacePixels) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      try {
        if (image.naturalWidth !== 1536 || image.naturalHeight !== 1872) {
          throw new Error('Unrecognised registered Chebby atlas geometry');
        }
        const scratch = document.createElement('canvas');
        scratch.width = 192; scratch.height = 208;
        const ctx = scratch.getContext('2d', { willReadFrequently: true });
        const display = canvas.getContext('2d');
        if (!ctx || !display) throw new Error('Canvas unavailable');
        const frames = [];
        for (let i = 0; i < 10; i++) {
          ctx.clearRect(0, 0, 192, 208);
          ctx.drawImage(image, (i % 8) * 192, Math.floor(i / 8) * 208, 192, 208, 0, 0, 192, 208);
          frames.push(ctx.getImageData(0, 0, 192, 208).data);
        }
        canvas.width = 192; canvas.height = 208;
        // Two immutable gameplay faces, separate from the live speech canvas.
        // Both use the atlas's original O (frame 6), never a painted mouth overlay.
        const captureCanvases = {};
        for (const mode of ['draining', 'decaying']) {
          const capture = document.createElement('canvas');capture.width = 192;capture.height = 208;
          capture.getContext('2d').putImageData(new ImageData(composeFacePixels(frames, {
            viseme: 6, previousViseme: 6, blend: 1, aperture: 1, voiced: true,
            blink: mode === 'decaying' ? 0.48 : 0, emphasis: 0, tilt: 0, captureEmotion: mode,
          }), 192, 208), 0, 0);
          captureCanvases[mode] = capture;
        }
        let disposed = false;
        resolve({
          draw(pose) {
            if (!disposed) display.putImageData(new ImageData(compose(frames, pose), 192, 208), 0, 0);
          },
          destroy() { disposed = true;for (const capture of Object.values(captureCanvases)) { capture.width = 0;capture.height = 0; } },
          frames, captureCanvases,
        });
      } catch (error) { reject(error); }
    };
    image.onerror = () => reject(new Error('Chebby atlas could not be loaded'));
    image.src = url;
  });
}
