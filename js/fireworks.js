(function setupFireworkSequence() {
  const LAUNCH_DURATION = 780;
  const ROCKET_STAGGER = 55;
  const BURST_DURATION = 260;
  const FORMATION_DURATION = 1000;
  const START_SPREAD = 44;
  let sequenceFrameId = null;
  let formationFrameId = null;
  const state = window.fireworkState;
  const previewButton = document.getElementById("previewButton");
  const markerArea = document.getElementById("launchMarkerArea");
  const easeOutQuart = (progress) => 1 - Math.pow(1 - progress, 4);
  const easeInOutCubic = (progress) => progress < 0.5 ? 4 * progress ** 3 : 1 - ((-2 * progress + 2) ** 3) / 2;
  const getBurstPoint = () => ({ x: window.fireworkCanvas.width / 2, y: window.fireworkCanvas.height * 0.48 });
  const getLaunchPoints = (count) => Array.from({ length: count }, (_, index) => ({ x: window.fireworkCanvas.width * (index + 1) / (count + 1), y: window.fireworkCanvas.height - 14 }));

  function renderLaunchMarkers() {
    markerArea.replaceChildren();
    const line = document.createElement("span");
    line.className = "marker-line";
    markerArea.append(line);
    for (const point of getLaunchPoints(state.launchPointCount)) {
      const marker = document.createElement("span");
      marker.className = "launch-marker";
      marker.style.left = `${point.x / window.fireworkCanvas.width * 100}%`;
      markerArea.append(marker);
    }
  }
  const setMarkersVisible = (visible) => markerArea.classList.toggle("is-hidden", !visible);
  const renderParticles = () => {
    const context = window.fireworkContext;
    window.drawCanvasBackground(); context.save();
    for (const particle of state.particles) { context.fillStyle = particle.color; context.globalAlpha = particle.alpha; context.fillRect(particle.currentX, particle.currentY, 2, 2); }
    context.restore();
  };
  function renderRockets(rockets) {
    const context = window.fireworkContext;
    window.drawCanvasBackground(); context.save();
    for (const rocket of rockets) {
      const trailProgress = Math.max(0, rocket.progress - 0.13);
      const trailX = rocket.startX + (rocket.burstX - rocket.startX) * trailProgress;
      const trailY = rocket.startY + (rocket.burstY - rocket.startY) * trailProgress;
      const trail = context.createLinearGradient(trailX, trailY, rocket.x, rocket.y);
      trail.addColorStop(0, "rgba(184,151,255,0)"); trail.addColorStop(1, "rgba(229,217,255,.9)");
      context.strokeStyle = trail; context.lineWidth = 2; context.beginPath(); context.moveTo(trailX, trailY); context.lineTo(rocket.x, rocket.y); context.stroke();
      context.fillStyle = "#fff8d8"; context.shadowBlur = 16; context.shadowColor = "#c5aaff"; context.beginPath(); context.arc(rocket.x, rocket.y, 3.2, 0, Math.PI * 2); context.fill();
    }
    context.restore();
  }
  function renderBurst(point, progress) {
    const context = window.fireworkContext;
    const radius = 12 + progress * 52; const alpha = 1 - progress;
    window.drawCanvasBackground(); context.save();
    const glow = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
    glow.addColorStop(0, `rgba(255,251,219,${alpha})`); glow.addColorStop(.35, `rgba(205,168,255,${alpha * .75})`); glow.addColorStop(1, "rgba(145,99,255,0)");
    context.fillStyle = glow; context.beginPath(); context.arc(point.x, point.y, radius, 0, Math.PI * 2); context.fill(); context.restore();
  }
  function prepareFormationParticles(origin) {
    for (const particle of state.particles) {
      const angle = Math.random() * Math.PI * 2; const distance = Math.sqrt(Math.random()) * START_SPREAD;
      particle.startX = origin.x + Math.cos(angle) * distance; particle.startY = origin.y + Math.sin(angle) * distance;
      particle.currentX = particle.startX; particle.currentY = particle.startY; particle.x = particle.startX; particle.y = particle.startY; particle.progress = 0;
    }
  }
  function finishSequence() { state.playing = false; state.formationProgress = 0; sequenceFrameId = null; formationFrameId = null; previewButton.disabled = false; window.renderStaticParticles(state.particles); setMarkersVisible(true); }
  function animateFormation(startedAt) {
    const progress = Math.min((performance.now() - startedAt) / FORMATION_DURATION, 1); const eased = easeOutQuart(progress);
    for (const particle of state.particles) { particle.progress = progress; particle.currentX = particle.startX + (particle.targetX - particle.startX) * eased; particle.currentY = particle.startY + (particle.targetY - particle.startY) * eased; particle.x = particle.currentX; particle.y = particle.currentY; }
    renderParticles(); if (progress < 1) { formationFrameId = requestAnimationFrame(() => animateFormation(startedAt)); return; } finishSequence();
  }
  function animateBurst(startedAt, point) { const progress = Math.min((performance.now() - startedAt) / BURST_DURATION, 1); renderBurst(point, progress); if (progress < 1) { sequenceFrameId = requestAnimationFrame(() => animateBurst(startedAt, point)); return; } sequenceFrameId = null; prepareFormationParticles(point); renderParticles(); formationFrameId = requestAnimationFrame(() => animateFormation(performance.now())); }
  function animateLaunch(startedAt, rockets, burstPoint) {
    let allArrived = true;
    for (const rocket of rockets) { const local = Math.min(Math.max((performance.now() - startedAt - rocket.delay) / LAUNCH_DURATION, 0), 1); rocket.progress = easeInOutCubic(local); rocket.x = rocket.startX + (rocket.burstX - rocket.startX) * rocket.progress; rocket.y = rocket.startY + (rocket.burstY - rocket.startY) * rocket.progress; if (local < 1) allArrived = false; }
    renderRockets(rockets); if (!allArrived) { sequenceFrameId = requestAnimationFrame(() => animateLaunch(startedAt, rockets, burstPoint)); return; } sequenceFrameId = requestAnimationFrame(() => animateBurst(performance.now(), burstPoint));
  }
  window.stopFireworkSequence = () => { if (sequenceFrameId !== null) cancelAnimationFrame(sequenceFrameId); if (formationFrameId !== null) cancelAnimationFrame(formationFrameId); finishSequence(); };
  window.stopFormationAnimation = window.stopFireworkSequence;
  function startFireworkSequence() {
    if (!state.particles.length) return;
    if (state.playing) window.stopFireworkSequence();
    const burstPoint = getBurstPoint();
    const rockets = getLaunchPoints(state.launchPointCount).map((point, index) => ({ startX: point.x, startY: point.y, x: point.x, y: point.y, burstX: burstPoint.x, burstY: burstPoint.y, progress: 0, delay: index * ROCKET_STAGGER }));
    state.playing = true; previewButton.disabled = true; setMarkersVisible(false); renderRockets(rockets); sequenceFrameId = requestAnimationFrame(() => animateLaunch(performance.now(), rockets, burstPoint));
  }
  document.querySelectorAll("[data-launch-count]").forEach((button) => button.addEventListener("click", () => { if (state.playing) return; state.launchPointCount = Number(button.dataset.launchCount); document.querySelectorAll("[data-launch-count]").forEach((item) => item.classList.toggle("is-selected", item === button)); renderLaunchMarkers(); }));
  previewButton.addEventListener("click", startFireworkSequence);
  window.startFormationAnimation = startFireworkSequence;
  window.fireworkLaunchConfig = { LAUNCH_DURATION, ROCKET_STAGGER, BURST_DURATION };
  renderLaunchMarkers();
})();
