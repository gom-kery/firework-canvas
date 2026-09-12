(function setupParticleSamplingAndColor() {
  const ALPHA_THRESHOLD = 32;
  const PARTICLE_PRESETS = { low: 2000, normal: 5000, high: 9000 };
  const CANVAS_PADDING = 56;
  const PALETTE_SIZE = 5;
  const QUANTIZATION_STEP = 32;
  const samplingCanvas = document.createElement("canvas");
  const samplingContext = samplingCanvas.getContext("2d", { willReadFrequently: true });
  const state = window.fireworkState;
  const swatches = document.getElementById("paletteSwatches");

  const toCssColor = (color) => `rgb(${color.r}, ${color.g}, ${color.b})`;
  const getFittedBounds = (image, canvas) => {
    const availableWidth = canvas.width - CANVAS_PADDING * 2;
    const availableHeight = canvas.height - CANVAS_PADDING * 2;
    const scale = Math.min(availableWidth / image.naturalWidth, availableHeight / image.naturalHeight, 1);
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    return { width, height, x: Math.round((canvas.width - width) / 2), y: Math.round((canvas.height - height) / 2) };
  };
  const getSamplingStep = (width, height, limit) => Math.max(2, Math.round(Math.sqrt((width * height) / limit)));

  window.createParticlesFromImage = function createParticlesFromImage(image, mode = state.particleMode) {
    const bounds = getFittedBounds(image, window.fireworkCanvas);
    const step = getSamplingStep(bounds.width, bounds.height, PARTICLE_PRESETS[mode]);
    samplingCanvas.width = bounds.width; samplingCanvas.height = bounds.height;
    samplingContext.clearRect(0, 0, bounds.width, bounds.height);
    samplingContext.drawImage(image, 0, 0, bounds.width, bounds.height);
    const pixels = samplingContext.getImageData(0, 0, bounds.width, bounds.height).data;
    const particles = [];
    for (let y = 0; y < bounds.height; y += step) {
      for (let x = 0; x < bounds.width; x += step) {
        const index = (y * bounds.width + x) * 4;
        const alpha = pixels[index + 3];
        if (alpha < ALPHA_THRESHOLD) continue;
        const color = { r: pixels[index], g: pixels[index + 1], b: pixels[index + 2] };
        const targetX = bounds.x + x; const targetY = bounds.y + y;
        particles.push({ x: targetX, y: targetY, targetX, targetY, color, paint: toCssColor(color), alpha: alpha / 255 });
      }
    }
    return particles;
  };

  function extractPalette(particles) {
    const buckets = new Map();
    for (const particle of particles) {
      const { r, g, b } = particle.color;
      const key = `${Math.floor(r / QUANTIZATION_STEP)}-${Math.floor(g / QUANTIZATION_STEP)}-${Math.floor(b / QUANTIZATION_STEP)}`;
      const bucket = buckets.get(key) || { count: 0, r: 0, g: 0, b: 0 };
      bucket.count += 1; bucket.r += r; bucket.g += g; bucket.b += b; buckets.set(key, bucket);
    }
    return [...buckets.values()]
      .sort((left, right) => right.count - left.count)
      .slice(0, PALETTE_SIZE)
      .map((bucket) => ({ r: Math.round(bucket.r / bucket.count), g: Math.round(bucket.g / bucket.count), b: Math.round(bucket.b / bucket.count) }));
  }
  function findClosestPaletteColor(color, palette) {
    let closest = palette[0]; let shortestDistance = Infinity;
    for (const candidate of palette) {
      const distance = (color.r - candidate.r) ** 2 + (color.g - candidate.g) ** 2 + (color.b - candidate.b) ** 2;
      if (distance < shortestDistance) { shortestDistance = distance; closest = candidate; }
    }
    return closest;
  }
  function renderPaletteSwatches() {
    swatches.replaceChildren();
    if (state.colorMode !== "palette" || !state.palette.length) { swatches.hidden = true; return; }
    for (const color of state.palette) {
      const swatch = document.createElement("span"); swatch.className = "palette-swatch";
      swatch.style.backgroundColor = toCssColor(color); swatch.title = toCssColor(color); swatches.append(swatch);
    }
    swatches.hidden = false;
  }
  function updateColorSelection(activeButton) { document.querySelectorAll("[data-color-mode]").forEach((button) => button.classList.toggle("is-selected", button === activeButton)); }
  window.applyColorMode = function applyColorMode(mode, activeButton) {
    if (!state.particles.length) { state.colorMode = mode; if (activeButton) updateColorSelection(activeButton); return; }
    state.colorMode = mode;
    if (mode === "palette") {
      if (!state.palette.length) state.palette = extractPalette(state.particles);
      for (const particle of state.particles) particle.paint = toCssColor(findClosestPaletteColor(particle.color, state.palette));
    } else {
      for (const particle of state.particles) particle.paint = toCssColor(particle.color);
    }
    if (activeButton) updateColorSelection(activeButton);
    renderPaletteSwatches();
    window.renderStaticParticles(state.particles);
  };
  window.renderStaticParticles = function renderStaticParticles(particles) {
    const context = window.fireworkContext;
    window.drawCanvasBackground(); context.save();
    for (const particle of particles) { context.fillStyle = particle.paint; context.globalAlpha = particle.alpha; context.fillRect(particle.targetX, particle.targetY, 2, 2); }
    context.restore();
  };
  function applyParticlePreset(mode, button) {
    if (state.playing && window.stopFireworkSequence) window.stopFireworkSequence();
    state.particleMode = mode;
    document.querySelectorAll("[data-particle-mode]").forEach((item) => item.classList.toggle("is-selected", item === button));
    if (!state.image) return;
    const startedAt = performance.now(); state.particles = window.createParticlesFromImage(state.image, mode); state.particleBuildMs = performance.now() - startedAt;
    state.palette = []; window.applyColorMode(state.colorMode);
  }
  document.querySelectorAll("[data-particle-mode]").forEach((button) => button.addEventListener("click", () => applyParticlePreset(button.dataset.particleMode, button)));
  document.querySelectorAll("[data-color-mode]").forEach((button) => button.addEventListener("click", () => { if (state.playing) return; window.applyColorMode(button.dataset.colorMode, button); }));
  window.particleSamplingConfig = { ALPHA_THRESHOLD, PARTICLE_PRESETS, PALETTE_SIZE, QUANTIZATION_STEP };
})();
