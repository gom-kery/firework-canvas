(function setupFormationAnimation() {
  const FORMATION_DURATION = 1000;
  const START_SPREAD = 44;
  let frameId = null;

  function easeOutQuart(progress) {
    return 1 - Math.pow(1 - progress, 4);
  }

  function prepareFormationParticles(particles) {
    const centerX = window.fireworkCanvas.width / 2;
    const centerY = window.fireworkCanvas.height * 0.48;
    for (const particle of particles) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.sqrt(Math.random()) * START_SPREAD;
      particle.startX = centerX + Math.cos(angle) * distance;
      particle.startY = centerY + Math.sin(angle) * distance;
      particle.currentX = particle.startX;
      particle.currentY = particle.startY;
      particle.x = particle.startX;
      particle.y = particle.startY;
      particle.progress = 0;
    }
  }

  function renderFormationParticles(particles) {
    const context = window.fireworkContext;
    window.drawCanvasBackground();
    context.save();
    for (const particle of particles) {
      context.fillStyle = particle.color;
      context.globalAlpha = particle.alpha;
      context.fillRect(particle.currentX, particle.currentY, 2, 2);
    }
    context.restore();
  }

  function resetToStaticRender() {
    const state = window.fireworkState;
    state.playing = false;
    state.formationProgress = 0;
    frameId = null;
    if (state.particles.length) window.renderStaticParticles(state.particles);
  }

  window.stopFormationAnimation = function stopFormationAnimation() {
    if (frameId !== null) cancelAnimationFrame(frameId);
    resetToStaticRender();
  };

  function animateFormation(startedAt) {
    const state = window.fireworkState;
    const elapsed = performance.now() - startedAt;
    const progress = Math.min(elapsed / FORMATION_DURATION, 1);
    const easedProgress = easeOutQuart(progress);

    for (const particle of state.particles) {
      particle.progress = progress;
      particle.currentX = particle.startX + (particle.targetX - particle.startX) * easedProgress;
      particle.currentY = particle.startY + (particle.targetY - particle.startY) * easedProgress;
      particle.x = particle.currentX;
      particle.y = particle.currentY;
    }
    state.formationProgress = progress;
    renderFormationParticles(state.particles);

    if (progress < 1) {
      frameId = requestAnimationFrame(() => animateFormation(startedAt));
      return;
    }
    state.playing = false;
    frameId = null;
    window.renderStaticParticles(state.particles);
  }

  window.startFormationAnimation = function startFormationAnimation() {
    const state = window.fireworkState;
    if (!state.particles.length) return;
    if (frameId !== null) cancelAnimationFrame(frameId);
    prepareFormationParticles(state.particles);
    state.playing = true;
    state.formationProgress = 0;
    renderFormationParticles(state.particles);
    frameId = requestAnimationFrame(() => animateFormation(performance.now()));
  };

  document.getElementById("previewButton").addEventListener("click", window.startFormationAnimation);
  window.formationConfig = { FORMATION_DURATION, START_SPREAD };
})();
