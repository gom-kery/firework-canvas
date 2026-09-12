(function setupParticleSampling() {
  const ALPHA_THRESHOLD = 32;
  const PARTICLE_PRESETS = { low: 2000, normal: 5000, high: 9000 };
  const CANVAS_PADDING = 56;
  const samplingCanvas = document.createElement("canvas");
  const samplingContext = samplingCanvas.getContext("2d", { willReadFrequently: true });

  function getFittedBounds(image, canvas) {
    const availableWidth = canvas.width - CANVAS_PADDING * 2;
    const availableHeight = canvas.height - CANVAS_PADDING * 2;
    const scale = Math.min(availableWidth / image.naturalWidth, availableHeight / image.naturalHeight, 1);
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    return { width, height, x: Math.round((canvas.width - width) / 2), y: Math.round((canvas.height - height) / 2) };
  }

  function getSamplingStep(width, height, particleLimit) {
    return Math.max(2, Math.round(Math.sqrt((width * height) / particleLimit)));
  }

  window.createParticlesFromImage = function createParticlesFromImage(image, mode = window.fireworkState.particleMode) {
    const canvas = window.fireworkCanvas;
    const bounds = getFittedBounds(image, canvas);
    const step = getSamplingStep(bounds.width, bounds.height, PARTICLE_PRESETS[mode]);
    samplingCanvas.width = bounds.width;
    samplingCanvas.height = bounds.height;
    samplingContext.clearRect(0, 0, bounds.width, bounds.height);
    samplingContext.drawImage(image, 0, 0, bounds.width, bounds.height);
    const pixels = samplingContext.getImageData(0, 0, bounds.width, bounds.height).data;
    const particles = [];

    for (let y = 0; y < bounds.height; y += step) {
      for (let x = 0; x < bounds.width; x += step) {
        const index = (y * bounds.width + x) * 4;
        const alpha = pixels[index + 3];
        if (alpha < ALPHA_THRESHOLD) continue;
        const targetX = bounds.x + x;
        const targetY = bounds.y + y;
        particles.push({ x: targetX, y: targetY, targetX, targetY, color: `rgb(${pixels[index]}, ${pixels[index + 1]}, ${pixels[index + 2]})`, alpha: alpha / 255 });
      }
    }
    return particles;
  };

  window.renderStaticParticles = function renderStaticParticles(particles) {
    const context = window.fireworkContext;
    window.drawCanvasBackground();
    context.save();
    for (const particle of particles) {
      context.fillStyle = particle.color;
      context.globalAlpha = particle.alpha;
      context.fillRect(particle.targetX, particle.targetY, 2, 2);
    }
    context.restore();
  };

  function updatePresetSelection(activeButton) {
    document.querySelectorAll("[data-particle-mode]").forEach((button) => button.classList.toggle("is-selected", button === activeButton));
  }

  function applyParticlePreset(mode, button) {
    const state = window.fireworkState;
    if (state.playing && window.stopFireworkSequence) window.stopFireworkSequence();
    state.particleMode = mode;
    updatePresetSelection(button);
    if (!state.image) return;
    const startedAt = performance.now();
    state.particles = window.createParticlesFromImage(state.image, mode);
    state.particleBuildMs = performance.now() - startedAt;
    window.renderStaticParticles(state.particles);
  }

  document.querySelectorAll("[data-particle-mode]").forEach((button) => {
    button.addEventListener("click", () => applyParticlePreset(button.dataset.particleMode, button));
  });
  window.particleSamplingConfig = { ALPHA_THRESHOLD, PARTICLE_PRESETS, CANVAS_PADDING };
})();
